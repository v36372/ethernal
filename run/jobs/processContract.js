const axios = require('axios');
const ethers = require('ethers');
const { sanitize, withTimeout } = require('../lib/utils');
const yasold = require('../lib/yasold');
const { contractFn } = require('../lib/codeRunner');
const db = require('../lib/firebase');
const { ContractConnector, ERC721Connector } = require('../lib/rpc');
const { Workspace, Contract, CustomField } = require('../models');
const { getScannerKey } = require('../lib/env');
const logger = require('../lib/logger');
const { trigger } = require('../lib/pusher');

const findPatterns = async (rpcServer, contractAddress, abi) => {
    console.log(`[DEBUG] findPatterns - Starting pattern detection for contract: ${contractAddress}`);
    let tokenData = { patterns: [] };
    const contract = new ContractConnector(rpcServer, contractAddress, abi);

    console.log(`[DEBUG] findPatterns - Checking token types for ${contractAddress} at ${rpcServer}`);
    const isErc20 = await contract.isErc20();
    const isErc721 = await contract.isErc721();
    const isErc1155 = await contract.isErc1155();

    console.log(`[DEBUG] findPatterns - Token types detected: ERC20=${isErc20}, ERC721=${isErc721}, ERC1155=${isErc1155}`);

    if (isErc20 || isErc721 || isErc1155) {
        console.log(`[DEBUG] findPatterns - Fetching token data for ${contractAddress}`);

        const decimals = await contract.decimals();
        const symbol = await contract.symbol();
        const name = await contract.name();
        const totalSupply = await contract.totalSupply();

        console.log(`[DEBUG] findPatterns - Token data fetched: decimals=${decimals}, symbol=${symbol}, name=${name}, totalSupply=${totalSupply}`);

        tokenData = sanitize({
            ...tokenData,
            tokenDecimals: decimals,
            tokenSymbol: symbol,
            tokenName: name,
            tokenTotalSupply: totalSupply,
        });

        if (isErc20) tokenData.patterns.push('erc20');
        if (isErc721) tokenData.patterns.push('erc721');
        if (isErc1155) tokenData.patterns.push('erc1155');

        console.log(`[DEBUG] findPatterns - Patterns added: ${tokenData.patterns.join(', ')}`);

        const isProxy = await contract.isProxy();
        if (isProxy) {
            console.log(`[DEBUG] findPatterns - Proxy pattern detected for ${contractAddress}`);
            tokenData.patterns.push('proxy');
        }
    } else {
        console.log(`[DEBUG] findPatterns - No token patterns detected for ${contractAddress}`);
    }

    if (isErc721) {
        console.log(`[DEBUG] findPatterns - Processing ERC721 metadata for ${contractAddress}`);
        const erc721Connector = new ERC721Connector(rpcServer, contractAddress, abi);
        const has721Metadata = await erc721Connector.hasMetadata();
        const has721Enumerable = await erc721Connector.isEnumerable();

        console.log(`[DEBUG] findPatterns - ERC721 features: metadata=${has721Metadata}, enumerable=${has721Enumerable}`);

        tokenData = sanitize({ ...tokenData, has721Metadata, has721Enumerable });
    }

    console.log(`[DEBUG] findPatterns - Final token data for ${contractAddress}:`, JSON.stringify(tokenData, null, 2));
    return tokenData;
};

const fetchEtherscanData = async (address, workspace) => {
    let scannerHost = 'api.etherscan.io/api';
    let apiKey = getScannerKey('ETHERSCAN');
    let headers = {};

    switch (workspace.chain) {
        case 'arbitrum':
            scannerHost = 'api.arbiscan.io/api';
            apiKey = getScannerKey('ARBISCAN');
            break;
        case 'bsc':
            scannerHost = 'api.bscscan.com/api';
            apiKey = getScannerKey('BSSCAN');
            break;
        case 'matic':
            scannerHost = 'api.polygonscan.com/api';
            apiKey = getScannerKey('POLYGONSCAN');
            break;
        case 'avax':
            scannerHost = 'api.snowtrace.io/api';
            apiKey = getScannerKey('SNOWTRACE');
            break;
        case 'buildbear':
            scannerHost = `api.buildbear.io/v1/explorer/slimy-jugsgernaut-ea0852a40`;
            apiKey = getScannerKey('BUILDBEAR');
            headers['Authorization'] = `Bearer ${apiKey}`;
            break;
        default:
        break;
    }

    if (!apiKey)
        return null;

    const endpoint = `https://${scannerHost}?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;
    try {
        const response = await withTimeout(axios.get(endpoint, { headers }));
        return response ? response.data : null;
    } catch (error) {
        if (error.response && error.response.status >= 400)
            return error.response;

        throw error;
    }
};

const findScannerMetadata = async (workspace, contract) => {
    const scannerData = await fetchEtherscanData(contract.address, workspace);

    if (scannerData && scannerData.status >= 400)
        return scannerData;

    if (scannerData && scannerData.message != 'NOTOK' && scannerData.result[0].ContractName != '') {
        const abi = JSON.parse(scannerData.result[0].ABI || '[]');

        const sources = scannerData.result[0].SourceCode;
        let parsedSources;
        if (sources.startsWith('{{'))
            try {
                parsedSources = JSON.parse(sources.substring(1, sources.length - 1)).sources;
            } catch (error) {
                parsedSources = null;
            }
        else
            parsedSources = {
                [`${scannerData.result[0].ContractName.split('.sol')[0]}.sol`]: { content: sources }
            };

        const verificationData = !parsedSources || scannerData.result[0].ABI == 'Contract source code not verified' ?
        null :
        {
            compilerVersion: scannerData.result[0].CompilerVersion,
            constructorArguments: scannerData.result[0].ConstructorArguments,
            runs: scannerData.result[0].Runs,
            contractName: scannerData.result[0].ContractName.split('.sol')[0],
            evmVersion: scannerData.result[0].EvmVersion,
            sources: parsedSources,
            libraries: scannerData.result[0].Library,
        };

        return {
            name: scannerData.result[0].ContractName.split('.sol')[0],
            verificationData,
            abi: abi,
            proxy: scannerData.result[0].Proxy == '1' ? scannerData.result[0].Implementation : null
        };
    }
    else
        return {};
};

module.exports = async job => {
    const data = job.data;

    if (!data.contractId)
        return 'Missing parameter';

    const contract = await Contract.findByPk(data.contractId, {
        include: {
            model: Workspace,
            as: 'workspace',
            include: [
                'explorer', 'user',
                {
                    model: CustomField,
                    as: 'customFields',
                    where: { location: 'contract' },
                    required: false
                }
            ]
        }
    });

    if (!contract)
        return 'Cannot find contract';

    const workspace = contract.workspace;
    const user = workspace.user;

    let asm, bytecode, hashedBytecode;

    // Always fetch bytecode from RPC if available, otherwise use stored bytecode
    const connector = new ContractConnector(workspace.rpcServer, contract.address, []);
    bytecode = await connector.getBytecode() || contract.bytecode;

    if (bytecode == '0x')
        return contract.safeDestroy();

    if (bytecode) {
        try {
            hashedBytecode = ethers.utils.keccak256(bytecode);
            asm = yasold.decompileToText(bytecode);
        } catch (error) {
            logger.error(error.message, { location: 'jobs.contractProcessing.asmDecompilation', error: error, data: data });
        }
    }

    const matchingLocalContract = hashedBytecode ? await db.getContractByHashedBytecode(workspace.id, hashedBytecode) : null;

    if (matchingLocalContract && matchingLocalContract.address != contract.address) {
        await db.storeContractData(user.firebaseUserId, workspace.name, contract.address, {
            abi: matchingLocalContract.abi,
        });
    }

    let scannerMetadata = await findScannerMetadata(workspace, contract);

    if (scannerMetadata && scannerMetadata.status >= 400)
        scannerMetadata = {};

    const abi = contract.abi || scannerMetadata.abi;
    console.log(`[DEBUG] processContract - Contract ${contract.address} workspace public: ${workspace.public}`);

    // Always process token data regardless of workspace public status
    const tokenData = await findPatterns(workspace.rpcServer, contract.address, abi);
    console.log(`[DEBUG] processContract - Token data processing result for ${contract.address}:`, JSON.stringify(tokenData, null, 2));

    let metadata = sanitize({
        bytecode, hashedBytecode, asm, abi,
        name: contract.name || scannerMetadata.name,
        proxy: scannerMetadata.proxy,
        ...tokenData
    });

    console.log(`[DEBUG] processContract - Final metadata for ${contract.address}:`, JSON.stringify(metadata, null, 2));

    if (metadata.proxy)
        await db.storeContractData(user.firebaseUserId, workspace.name, metadata.proxy, { address: metadata.proxy });

    if (scannerMetadata.verificationData)
        await db.storeContractVerificationData(workspace.id, contract.address, scannerMetadata.verificationData);

    if (workspace.customFields && workspace.customFields.length > 0) {
        for (const customField of workspace.customFields) {
            const extraFields = await contractFn(customField.function, contract, metadata);
            if (extraFields && typeof extraFields === 'object')
                metadata = sanitize({ ...metadata, ...extraFields });
        }
    }

    console.log(`[DEBUG] processContract - Storing contract data for ${contract.address} with metadata:`, JSON.stringify(metadata, null, 2));
    await db.storeContractData(user.firebaseUserId, workspace.name, contract.address, metadata);
    console.log(`[DEBUG] processContract - Successfully stored contract data for ${contract.address}`);

    return trigger(`private-contracts;workspace=${contract.workspaceId};address=${contract.address}`, 'updated', null);
};
