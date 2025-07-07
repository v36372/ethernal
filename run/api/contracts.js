const express = require('express');
const router = express.Router();
const logger = require('../lib/logger');
const Lock = require('../lib/lock');
const db = require('../lib/firebase');
const { getAppDomain } = require('../lib/env');
const { sanitize, sleep } = require('../lib/utils');
const workspaceAuthMiddleware = require('../middlewares/workspaceAuth');
const authMiddleware = require('../middlewares/auth');
const processContractVerification = require('../lib/processContractVerification');
const { holderHistory, circulatingSupply, holders, transfers } = require('./modules/tokens');
const { managedError, unmanagedError } = require('../lib/errors');
const verifierParamsFormatters = require('../lib/verifierParams');

router.get('/:address/holderHistory', workspaceAuthMiddleware, holderHistory);
router.get('/:address/circulatingSupply', workspaceAuthMiddleware, circulatingSupply);
router.get('/:address/holders', workspaceAuthMiddleware, holders);
router.get('/:address/transfers', workspaceAuthMiddleware, transfers);
router.get('/:address/evnd-transfers', workspaceAuthMiddleware, async (req, res, next) => {
    try {
        const { address } = req.params;
        const { page = 1, itemsPerPage = 10, orderBy = 'blockNumber', order = 'DESC' } = req.query;
        const workspaceId = req.query.workspace.id;

        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }

        // First, check if the requested address is the eVND token
        const { EvndContract, TokenTransfer, Transaction, Contract, sequelize } = require('../models');
        const { Op } = require('sequelize');

        const evndContract = await EvndContract.findOne({
            where: {
                workspaceId,
                contractType: 'evnd_token',
                isActive: true
            }
        });

        if (!evndContract) {
            return res.status(200).json({
                items: [],
                total: 0
            });
        }

        // Only return eVND transfers if the requested address is the eVND token
        if (address.toLowerCase() !== evndContract.address.toLowerCase()) {
            return res.status(200).json({
                items: [],
                total: 0
            });
        }

        console.log(`[DEBUG] Looking for eVND transfers for token ${address}, eVND token: ${evndContract.address}`);

        // Get all token transfers for the eVND token
        const { rows: tokenTransfers, count } = await TokenTransfer.findAndCountAll({
            where: {
                workspaceId,
                token: evndContract.address.toLowerCase()
            },
            include: [
                {
                    model: Transaction,
                    as: 'transaction',
                    attributes: ['hash', 'blockNumber', 'timestamp', 'methodDetails', 'data']
                },
                {
                    model: Contract,
                    as: 'contract',
                    attributes: ['id', 'patterns', 'tokenName', 'tokenSymbol', 'tokenDecimals', 'abi']
                }
            ],
            attributes: ['id', 'src', 'dst', 'token', 'tokenId', [sequelize.cast(sequelize.col('"TokenTransfer".amount'), 'numeric'), 'amount']],
            offset: (page - 1) * itemsPerPage,
            limit: itemsPerPage,
            order: [[{ model: Transaction, as: 'transaction' }, orderBy, order]]
        });

        console.log(`[DEBUG] Found ${tokenTransfers.length} eVND token transfers`);

        res.status(200).json({
            items: tokenTransfers.map(transfer => transfer.toJSON()),
            total: count
        });
    } catch (error) {
        console.error('Error fetching token eVND transfers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Retrieves a list of verified contracts for a workspace
 * @param {string} workspaceId - The workspace id
 * @param {number} page - The page number
 * @param {number} itemsPerPage - The number of items per page
 * @returns {Array} - A list of verified contracts
 */
router.get('/verified', workspaceAuthMiddleware, async (req, res, next) => {
    const data = req.query;

    try {
        const items = await db.getVerifiedContracts(data.workspace.id, data.page, data.itemsPerPage);

        res.status(200).json({ items });
    } catch(error) {
        unmanagedError(error, req, next);
    }
});

router.get('/getabi', async (req, res) => {
    const data = { ...req.query, ...req.body };

    try {
        if (!data.address)
            throw new Error('Missing parameters.')

        const contractAddress = data.address.toLowerCase();

        let explorer;
        if (req.headers['apx-incoming-host']) {
            explorer = await db.getPublicExplorerParamsByDomain(req.headers['apx-incoming-host'])
        }
        else if (req.headers['ethernal-host'] && req.headers['ethernal-host'].endsWith(getAppDomain())) {
            const host = req.headers['ethernal-host'].split(`.${getAppDomain()}`)[0];
            explorer = await db.getPublicExplorerParamsBySlug(host);
        }
        else if (data['apikey']) {
            explorer = await db.getPublicExplorerParamsBySlug(data['apikey']);
        }

        if (!explorer)
            throw new Error('Could not find explorer. If you are using the apiKey param, make sure it is correct.');

        let contract = await db.getContractByWorkspaceId(explorer.workspaceId, contractAddress);
        if (!contract || !contract.verification || !contract.verification.sources.length)
            return res.status(200).json({
                status: "0",
                message: "NOTOK",
                result: "Contract source code not verified"
            });

        return res.status(200).json({
            status: "1",
            message: "OK",
            result: JSON.stringify(contract.abi)
        });
    } catch(error) {
        logger.error(error.message, { location: 'get.api.contracts.getabi', error, data, headers: req.headers });
        res.status(200).json({
            status: "0",
            message: "OK",
            result: `Request failed: ${error.message}`
        });
    }
});

router.get('/sourceCode', async (req, res) => {
    const data = { ...req.query, ...req.body };

    try {
        if (!data.address)
            throw new Error('Missing parameters.')

        const contractAddress = data.address.toLowerCase();

        let explorer;
        if (req.headers['apx-incoming-host']) {
            explorer = await db.getPublicExplorerParamsByDomain(req.headers['apx-incoming-host'])
        }
        else if (data['apikey']) {
            explorer = await db.getPublicExplorerParamsBySlug(data['apikey']);
        }

        if (!explorer)
            throw new Error('Could not find explorer. If you are using the apiKey param, make sure it is correct.');

        let contract = await db.getContractByWorkspaceId(explorer.workspaceId, contractAddress);
        if (!contract) {
            for (let i = 0; i < 3; i++) {
                await sleep(2000);
                contract = await db.getContractByWorkspaceId(explorer.workspaceId, contractAddress);
                if (contract) 
                    break;
            }
        }

        if (!contract || !contract.verification || !contract.verification.sources.length)
            return res.status(200).json({
                status: "0",
                message: "KO"
            });

        const response = {
            SourceCode: contract.verification.sources[0].content,
            ABI: contract.abi,
            ContractName: contract.name,
            CompilerVersion: contract.verification.compilerVersion,
            OptimizationUsed: contract.verification.runs ? "1" : "0",
            Runs: contract.verification.runs,
            ConstructorArguments: contract.verification.constructorArguments,
            EVMVersion: contract.verification.evmVersion,
            Library: contract.verification.libraries
        }

        res.status(200).json({
            status: "1",
            message: "OK",
            result: [response]
        });
    } catch(error) {
        logger.error(error.message, { location: 'get.api.contracts.sourceCode', error, data });
        res.status(200).json({
            status: "0",
            message: "OK",
            result: `Request failed: ${error.message}`
        });
    }
});

router.post('/verify', async (req, res) => {
    const data = { ...req.body, ...req.query };
    let lock, isLockAcquired;

    try {
        if (!data.sourceCode || !data.contractaddress || !data.compilerversion || !data.contractname)
            throw new Error('Missing parameters.')

        const contractAddress = data.contractaddress.toLowerCase();

        let explorer;

        if (req.headers['apx-incoming-host']) {
            explorer = await db.getPublicExplorerParamsByDomain(req.headers['apx-incoming-host'])
        }
        else if (data['apikey']) {
            explorer = await db.getPublicExplorerParamsBySlug(data['apikey']);
        }

        if (!explorer)
            throw new Error('Could not find explorer. If you are using the apiKey param, make sure it is correct.');

        let contract = await db.getContractByWorkspaceId(explorer.workspaceId, contractAddress);
        if (!contract) {
            for (let i = 0; i < 3; i++) {
                await sleep(2000);
                contract = await db.getContractByWorkspaceId(explorer.workspaceId, contractAddress);
                if (contract)
                    break;
            }
        }

        if (!contract)
            throw new Error('Unable to locate contract. Please try running the verification command again.');

        if (contract.verification)
            return res.status(200).json({
                status: "1",
                message: "OK",
                result: "Already Verified"
            });

        lock = new Lock(`contractVerification-${explorer.id}-${contract.id}`, 60000);

        isLockAcquired = await lock.acquire();
        if (!isLockAcquired)
            throw new Error('There is already an ongoing verification for this contract.');

        await lock.acquire();

        const params = verifierParamsFormatters[data.codeformat](data);

        const payload = {
            publicExplorerParams: explorer,
            ...params
        }

        await processContractVerification(db, payload);

        await lock.release();

        res.status(200).json({
            status: "1",
            message: "OK",
            result: "1234"
        });
    } catch(error) {
        if (lock && isLockAcquired)
            await lock.release();
        logger.error(error.message, { location: 'post.api.contracts.verify', error, data });
        res.status(200).json({
            status: "0",
            message: "OK",
            result: `Contract verification failed: ${error.message}`
        });
    }
});

router.get('/verificationStatus', async (req, res) => {
    res.status(200).json({
        status: "1",
        message: "OK",
        result: "Pass - Verified"
    });
});

router.post('/verificationStatus', async (req, res) => {
    res.status(200).json({
        status: "1",
        message: "OK",
        result: "Pass - Verified"
    });
});

router.get('/:address/stats', workspaceAuthMiddleware, async (req, res, next) => {
    const data = req.query;
    try {
        if (!data.workspace || !req.params.address)
            return managedError(new Error('Missing parameter'), req, res);

        const result = await db.getTokenStats(data.workspace.id, req.params.address);

        res.status(200).json(result);
    } catch(error) {
        unmanagedError(error, req, next);
    }
});

router.get('/:address/logs', workspaceAuthMiddleware, async (req, res, next) => {
    const data = req.query;

    try {
        if (!data.workspace)
            return managedError(new Error(`Missing parameters`), req, res);

        const logs = await db.getContractLogs(data.workspace.id, req.params.address, data.signature, data.page, data.itemsPerPage, data.orderBy, data.order);

        res.status(200).json(logs);
    } catch(error) {
        unmanagedError(error, req, next);
    }
});

router.get('/processable', authMiddleware, async (req, res, next) => {
    const data = req.query;

    try {
        if (!data.firebaseUserId || !data.workspace)
            return managedError(new Error(`Missing parameters`), req, res);

        const contracts = await db.getUnprocessedContracts(data.firebaseUserId, data.workspace);

        res.status(200).json(contracts);
    } catch(error) {
        unmanagedError(error, req, next);
    }
});

router.post('/:address/watchedPaths', workspaceAuthMiddleware, async (req, res, next) => {
    const data = { ...req.query, ...req.body.data };

    try {
        if (!data.firebaseUserId || !data.workspace || !data.watchedPaths)
            return managedError(new Error(`Missing parameters`), req, res);

        const sanitizedData = sanitize({
            watchedPaths: data.watchedPaths,
        });

        await db.storeContractData(data.firebaseUserId, data.workspace, req.params.address, sanitizedData);

        res.sendStatus(200);
    } catch(error) {
        unmanagedError(error, req, next);
    }
});

router.post('/:address', authMiddleware, async (req, res, next) => {
    const data = req.body.data;

    try {
        if (!data.uid || !data.workspace)
            return managedError(new Error(`Missing parameters`), req, res);

        const sanitizedData = sanitize({
            address: data.address,
            name: data.name,
            abi: data.abi,
            hashedBytecode: data.hashedBytecode
        });

        // Remove contract sync restrictions - always allow syncing
        // const canSyncData = await db.canUserSyncContract(data.uid, data.workspace, req.params.address);
        // if (!canSyncData)
        //     return managedError(new Error('Free plan users are limited to 10 synced contracts. Upgrade to our Premium plan to sync more.'), req, res);

        await db.storeContractData(data.uid, data.workspace, req.params.address, sanitizedData);

        res.sendStatus(200);
    } catch(error) {
        unmanagedError(error, req, next);
    }
});

router.post('/:address/tokenProperties', authMiddleware, async (req, res, next) => {
    const data = req.body.data;
    try {
        if (!data.uid || !data.workspace)
            return managedError(new Error(`Missing parameters`), req, res);

        const workspace = await db.getWorkspaceByName(data.user.firebaseUserId, data.workspace);
        if (!workspace)
            return managedError(new Error('Could not find workspace.'), req, res);

        const contract = await db.getWorkspaceContract(workspace.id, req.params.address);
        if (!contract)
            return managedError(new Error('Could not find contract at this address.'), req, res);

        const newPatterns = data.properties.patterns ? [...new Set([...contract.patterns, ...data.properties.patterns])] : contract.patterns;

        let tokenData = {};
        if (data.properties) {
            tokenData = sanitize({
                patterns: newPatterns,
                tokenSymbol: data.properties.tokenSymbol,
                tokenDecimals: data.properties.tokenDecimals,
                tokenName: data.properties.tokenName,
                totalSupply: data.properties.totalSupply,
                has721Metadata: data.properties.has721Metadata,
                has721Enumerable: data.properties.has721Enumerable,
                bytecode: data.properties.bytecode
            });
        }

        await db.storeContractData(data.uid, data.workspace, req.params.address, {
            ...tokenData,
            processed: true
        });

        res.sendStatus(200);
    } catch(error) {
        unmanagedError(error, req, next);
    }
});

router.post('/:address/remove', authMiddleware, async (req, res, next) => {
    const data = req.body.data;
    try {
        await db.removeContract(data.uid, data.workspace, req.params.address);

        res.sendStatus(200);
    } catch(error) {
        unmanagedError(error, req, next);
    }
});

router.post('/:address/verify', async (req, res, next) => {
    const data = req.body;
    const address = req.params.address.toLowerCase();
    try {
         if (!data.explorerSlug || !data.compilerVersion || !data.code || !data.contractName)
            return managedError(new Error(`Missing parameter.`), req, res);

        const explorer = await db.getPublicExplorerParamsBySlug(data.explorerSlug);

        if (!explorer)
            return managedError(new Error('Could not find explorer, make sure you passed the correct slug.'), req, res);

        const contract = await db.getContract(explorer.userId, explorer.workspaceId, address)

        if (!contract)
            return managedError(new Error(`Couldn't find contract at address ${address}`), req, res);

        // if (contract.verificationStatus == 'pending')
        //     throw new Error('There already is an ongoing verification for this contract.');

        const payload = sanitize({
            publicExplorerParams: explorer,
            contractAddress: address,
            compilerVersion: data.compilerVersion,
            constructorArguments: data.constructorArguments,
            code: data.code,
            contractName: data.contractName,
            optimizer: data.optimizer,
            runs: data.runs,
            evmVersion: data.evmVersion,
            viaIR: data.viaIR
        });

        try {
            const result = await processContractVerification(db, payload);

            if (!result.verificationSucceded)
                throw new Error(result.reason);
        } catch(error) {
            return managedError(error, req, res);
        }

        const verifiedContract = await db.getContract(explorer.userId, explorer.workspaceId, address);

        res.status(200).json(verifiedContract.verification);
    } catch(error) {
        unmanagedError(error, req, next);
    }
});

router.get('/:address', workspaceAuthMiddleware, async (req, res, next) => {
    const data = req.query;

    try {
        const contract = await db.getWorkspaceContract(data.workspace.id, req.params.address);

        res.status(200).json(contract);
    } catch(error) {
        unmanagedError(error, req, next);
    }
});

router.get('/', workspaceAuthMiddleware, async (req, res, next) => {
    const data = req.query;

    try {
        const contracts = await db.getWorkspaceContracts(data.workspace.id, data.page, data.itemsPerPage, data.orderBy, data.order, data.pattern);

        res.status(200).json(contracts);
    } catch(error) {
        unmanagedError(error, req, next);
    }
});

module.exports = router;
