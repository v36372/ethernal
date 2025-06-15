const express = require('express');
const router = express.Router();
const workspaceAuthMiddleware = require('../middlewares/workspaceAuth');
const { EvndContract, EvndSystemMetrics } = require('../models');
const { ProviderConnector } = require('../lib/rpc');

/**
 * Get eVND contracts
 * Returns contract addresses for the workspace
 */
router.get('/contracts', workspaceAuthMiddleware, async (req, res, next) => {
    try {
        const workspaceId = req.query.workspace.id;

        const contracts = await EvndContract.findAll({
            where: { workspaceId, isActive: true }
        });

        // Helper function to format address for display
        const formatAddress = (address) => {
            if (!address) return '';
            return address.length > 10 ? 
                `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 
                address;
        };

        const formattedContracts = contracts.reduce((acc, contract) => {
            acc[contract.contractType] = {
                name: contract.name,
                icon: contract.icon,
                address: formatAddress(contract.address),
                fullAddress: contract.address
            };
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            contracts: formattedContracts
        });
    } catch(error) {
        console.error('Error fetching eVND contracts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get eVND dashboard data (test version without auth)
 * Returns system status information for eVND token dashboard
 */
router.get('/dashboard/test', async (req, res, next) => {
    try {
        // For testing - just return mock data
        const dashboardData = {
            systemStatus: 'VIETNAM e-VND CBDC SYSTEM STATUS',
            systemComponents: {
                evnd_token: {
                    name: 'e-VND Token',
                    icon: '💰',
                    address: '0xDc64...C6C9',
                    fullAddress: '0xDc6454B9F2F83b2A0F4b30D3C1c33F30c2C6C9'
                },
                exchange_portal: {
                    name: 'Exchange Portal',
                    icon: '🔄', 
                    address: '0x0B30...7016',
                    fullAddress: '0x0B30a94F3E0b72A8D89cFF0F6C1c7016'
                },
                entity_registry: {
                    name: 'Entity Registry',
                    icon: '📋',
                    address: '0x5FbD...0aa3', 
                    fullAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
                },
                compliance_registry: {
                    name: 'Compliance Registry',
                    icon: '⚖️',
                    address: '0xCf7E...0Fc9',
                    fullAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
                },
                musd: {
                    name: 'mUSD',
                    icon: '💵',
                    address: '0x9A67...7508',
                    fullAddress: '0x9A6743acD9A1C8e8a2B67e72f3d3a4C2c3c7508'
                }
            },
            systemMetrics: {
                totalEvndSupply: { label: 'Total e-VND Supply', value: '1,000,000,000 VND', rawValue: 1000000000 },
                verifiedEntities: { label: 'Verified Entities', value: '1,247 verified', rawValue: 1247 },
                dailyTransactions: { label: 'Daily Transactions', value: '12,450', rawValue: 12450 },
                complianceRules: { label: 'Compliance Rules', value: '5 active', rawValue: 5 },
                exchangeRate: { label: 'Exchange Rate', value: '1 USD = 24,000 VND', usdToVnd: 24000 }
            },
            verifiers: [
                {
                    address: '0x7099...79C8',
                    fullAddress: '0x7099B1E00D8b9aaEc2A87AaE0b1eA9Be79C8',
                    name: 'Ministry of Finance',
                    status: 'Active',
                    isActive: true
                },
                {
                    address: '0x3C44...93BC', 
                    fullAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                    name: 'State Bank Vietnam',
                    status: 'Active',
                    isActive: true
                }
            ],
            exchangePortalStatus: {
                currentRates: {
                    usdToVnd: 24000,
                    lastUpdated: '2 min ago',
                    displayText: '1 USD = 24,000 e-VND'
                },
                moneyFlowAnalytics: {
                    today: { inflow: '+125M e-VND inflow', transactions: '2,340 transactions' },
                    thisMonth: { net: '+2.1B e-VND net', transactions: '45,600 transactions' },
                    thisYear: { net: '+12.5B e-VND net', transactions: '891,200 transactions' }
                }
            }
        };

        res.status(200).json(dashboardData);
    } catch(error) {
        console.error('Error fetching eVND dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get eVND dashboard data
 * Returns system status information for eVND token dashboard
 */
router.get('/dashboard', workspaceAuthMiddleware, async (req, res, next) => {
    try {
        const workspaceId = req.query.workspace.id;
        const workspace = req.query.workspace;

        // Fetch contracts from database
        const contracts = await EvndContract.findAll({
            where: { workspaceId, isActive: true }
        });

        // Fetch system metrics from database
        let systemMetrics = await EvndSystemMetrics.findOne({
            where: { workspaceId }
        });

        // If no metrics exist, create default ones
        if (!systemMetrics) {
            systemMetrics = await EvndSystemMetrics.create({
                workspaceId,
                totalEvndSupply: 0,
                verifiedEntities: 0,
                dailyTransactions: 0,
                complianceRules: 0,
                usdToVndRate: 24000
            });
        }

        // Helper function to format address for display
        const formatAddress = (address) => {
            if (!address) return '';
            return address.length > 10 ? 
                `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 
                address;
        };

        // Format system components
        const systemComponents = contracts.reduce((acc, contract) => {
            acc[contract.contractType] = {
                name: contract.name,
                icon: contract.icon,
                address: formatAddress(contract.address),
                fullAddress: contract.address
            };
            return acc;
        }, {});

        // Fetch total supply from blockchain if eVND token contract exists
        let totalSupply = systemMetrics.totalEvndSupply || 0;
        const evndTokenContract = contracts.find(c => c.contractType === 'evnd_token');
        
        if (evndTokenContract && workspace.rpcServer) {
            try {
                const provider = new ProviderConnector(workspace.rpcServer);
                // Call totalSupply() function - method selector: 0x18160ddd
                const result = await provider.call({
                    to: evndTokenContract.address,
                    data: '0x18160ddd'
                });
                
                if (result && result !== '0x') {
                    totalSupply = parseInt(result, 16);
                    // Update the database with the latest supply
                    await systemMetrics.update({ totalEvndSupply: totalSupply });
                }
            } catch (error) {
                console.warn('Failed to fetch total supply from blockchain:', error.message);
                // Fall back to database value
            }
        }

        // Format system metrics
        const formattedSystemMetrics = {
            totalEvndSupply: {
                label: 'Total e-VND Supply',
                value: `${totalSupply.toLocaleString()} VND`,
                rawValue: totalSupply
            },
            verifiedEntities: {
                label: 'Verified Entities',
                value: `${(systemMetrics.verifiedEntities || 0).toLocaleString()} verified`,
                rawValue: systemMetrics.verifiedEntities || 0
            },
            dailyTransactions: {
                label: 'Daily Transactions',
                value: (systemMetrics.dailyTransactions || 0).toLocaleString(),
                rawValue: systemMetrics.dailyTransactions || 0
            },
            complianceRules: {
                label: 'Compliance Rules',
                value: `${systemMetrics.complianceRules || 0} active`,
                rawValue: systemMetrics.complianceRules || 0
            },
            exchangeRate: {
                label: 'Exchange Rate',
                value: `1 USD = ${(systemMetrics.usdToVndRate || 0).toLocaleString()} VND`,
                usdToVnd: systemMetrics.usdToVndRate || 0
            }
        };

        const dashboardData = {
            systemStatus: 'VIETNAM e-VND CBDC SYSTEM STATUS',
            systemComponents,
            systemMetrics: formattedSystemMetrics,
            verifiers: [
                {
                    address: '0x7099...79C8',
                    fullAddress: '0x7099B1E00D8b9aaEc2A87AaE0b1eA9Be79C8',
                    name: 'Ministry of Finance',
                    status: 'Active',
                    isActive: true
                },
                {
                    address: '0x3C44...93BC',
                    fullAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                    name: 'State Bank Vietnam',
                    status: 'Active',
                    isActive: true
                }
            ],
            exchangePortalStatus: {
                currentRates: {
                    usdToVnd: systemMetrics.usdToVndRate || 24000,
                    lastUpdated: '2 min ago',
                    displayText: `1 USD = ${(systemMetrics.usdToVndRate || 24000).toLocaleString()} e-VND`
                },
                moneyFlowAnalytics: {
                    today: { inflow: '+125M e-VND inflow', transactions: '2,340 transactions' },
                    thisMonth: { net: '+2.1B e-VND net', transactions: '45,600 transactions' },
                    thisYear: { net: '+12.5B e-VND net', transactions: '891,200 transactions' }
                }
            }
        };

        res.status(200).json(dashboardData);
    } catch(error) {
        console.error('Error fetching eVND dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Setup Anvil contracts (bulk setup for development)
 * POST /api/evnd/contracts/setup-anvil
 */
router.post('/contracts/setup-anvil', workspaceAuthMiddleware, async (req, res, next) => {
    try {
        const workspaceId = req.query.workspace.id;

        // Default Anvil contract addresses
        const anvilContracts = {
            deployer_admin: {
                name: 'Deployer Admin',
                address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                icon: '👑'
            },
            proxy_admin: {
                name: 'Proxy Admin',
                address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
                icon: '🔧'
            },
            entity_registry: {
                name: 'Entity Registry',
                address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
                icon: '📋'
            },
            compliance_registry: {
                name: 'Compliance Registry',
                address: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
                icon: '⚖️'
            },
            evnd_token: {
                name: 'eVND Token',
                address: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
                icon: '💰'
            },
            exchange_portal: {
                name: 'Exchange Portal',
                address: '0x67d269191c92Caf3cD7723F116c85e6E9bf55933',
                icon: '🔄'
            },
            address_restriction_compliance: {
                name: 'Address Restriction Compliance',
                address: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
                icon: '🚫'
            },
            verification_compliance: {
                name: 'Verification Compliance',
                address: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
                icon: '✅'
            },
            supply_compliance: {
                name: 'Supply Compliance',
                address: '0x9A676e781A523b5d0C0e43731313A708CB607508',
                icon: '📊'
            },
            transaction_type_compliance: {
                name: 'Transaction Type Compliance',
                address: '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1',
                icon: '🔄'
            },
            entity_type_compliance: {
                name: 'Entity Type Compliance',
                address: '0x68B1D87F95878fE05B998F19b66F4baba5De1aed',
                icon: '🏢'
            },
            verifier_1: {
                name: 'Verifier 1',
                address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
                icon: '🔍'
            },
            verifier_2: {
                name: 'Verifier 2',
                address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                icon: '🔍'
            },
            blacklister_1: {
                name: 'Blacklister 1',
                address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
                icon: '⛔'
            },
            blacklister_2: {
                name: 'Blacklister 2',
                address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
                icon: '⛔'
            }
        };

        const createdContracts = [];

        for (const [contractType, contractData] of Object.entries(anvilContracts)) {
            const [contract, created] = await EvndContract.upsert({
                workspaceId,
                contractType,
                name: contractData.name,
                address: contractData.address,
                icon: contractData.icon,
                isActive: true
            });

            createdContracts.push({
                contractType,
                name: contract.name,
                address: contract.address,
                icon: contract.icon,
                created
            });
        }

        res.status(200).json({
            success: true,
            message: 'Anvil contracts setup completed',
            contracts: createdContracts
        });
    } catch(error) {
        console.error('Error setting up Anvil contracts:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Update or create eVND contracts
 * PUT /api/evnd/contracts
 */
router.put('/contracts', workspaceAuthMiddleware, async (req, res, next) => {
    try {
        const workspaceId = req.query.workspace.id;
        const { contracts } = req.body;

        if (!contracts || typeof contracts !== 'object') {
            return res.status(400).json({ error: 'Contracts object is required' });
        }

        const validContractTypes = [
            'evnd_token', 
            'exchange_portal', 
            'entity_registry', 
            'compliance_registry', 
            'proxy_admin',
            'address_restriction_compliance',
            'verification_compliance', 
            'supply_compliance',
            'transaction_type_compliance',
            'entity_type_compliance',
            'deployer_admin',
            'verifier_1',
            'verifier_2', 
            'blacklister_1',
            'blacklister_2'
        ];
        const updatedContracts = [];

        for (const [contractType, contractData] of Object.entries(contracts)) {
            if (!validContractTypes.includes(contractType)) {
                return res.status(400).json({ error: `Invalid contract type: ${contractType}` });
            }

            if (!contractData.address || !contractData.name) {
                return res.status(400).json({ error: `Address and name are required for ${contractType}` });
            }

            // Validate Ethereum address format
            if (!/^0x[a-fA-F0-9]{40}$/.test(contractData.address)) {
                return res.status(400).json({ error: `Invalid Ethereum address for ${contractType}` });
            }

            const [contract, created] = await EvndContract.upsert({
                workspaceId,
                contractType,
                name: contractData.name,
                address: contractData.address,
                icon: contractData.icon || '',
                isActive: true
            });

            updatedContracts.push({
                contractType,
                name: contract.name,
                address: contract.address,
                icon: contract.icon,
                created
            });
        }

        res.status(200).json({
            success: true,
            message: 'Contracts updated successfully',
            contracts: updatedContracts
        });
    } catch(error) {
        console.error('Error updating eVND contracts:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Update a single eVND contract
 * PUT /api/evnd/contracts/:contractType
 */
router.put('/contracts/:contractType', workspaceAuthMiddleware, async (req, res, next) => {
    try {
        const workspaceId = req.query.workspace.id;
        const { contractType } = req.params;
        const { name, address, icon } = req.body;

        const validContractTypes = [
            'evnd_token', 
            'exchange_portal', 
            'entity_registry', 
            'compliance_registry', 
            'proxy_admin',
            'address_restriction_compliance',
            'verification_compliance', 
            'supply_compliance',
            'transaction_type_compliance',
            'entity_type_compliance',
            'deployer_admin',
            'verifier_1',
            'verifier_2', 
            'blacklister_1',
            'blacklister_2'
        ];
        
        if (!validContractTypes.includes(contractType)) {
            return res.status(400).json({ error: `Invalid contract type: ${contractType}` });
        }

        if (!address || !name) {
            return res.status(400).json({ error: 'Address and name are required' });
        }

        // Validate Ethereum address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({ error: 'Invalid Ethereum address format' });
        }

        const [contract, created] = await EvndContract.upsert({
            workspaceId,
            contractType,
            name,
            address,
            icon: icon || '',
            isActive: true
        });

        res.status(200).json({
            success: true,
            message: `${contractType} updated successfully`,
            contract: {
                contractType,
                name: contract.name,
                address: contract.address,
                icon: contract.icon,
                created
            }
        });
    } catch(error) {
        console.error('Error updating eVND contract:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Delete a contract
 * DELETE /api/evnd/contracts/:contractType
 */
router.delete('/contracts/:contractType', workspaceAuthMiddleware, async (req, res, next) => {
    try {
        const workspaceId = req.query.workspace.id;
        const { contractType } = req.params;

        const deleted = await EvndContract.destroy({
            where: {
                workspaceId,
                contractType
            }
        });

        if (deleted === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        res.status(200).json({
            success: true,
            message: `${contractType} deleted successfully`
        });
    } catch(error) {
        console.error('Error deleting eVND contract:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Update system metrics
 * PUT /api/evnd/metrics
 * Body: {
 *   verifiedEntities?: number,
 *   dailyTransactions?: number,
 *   complianceRules?: number,
 *   usdToVndRate?: number
 * }
 */
router.put('/metrics', workspaceAuthMiddleware, async (req, res, next) => {
    try {
        const workspaceId = req.query.workspace.id;
        const { verifiedEntities, dailyTransactions, complianceRules, usdToVndRate } = req.body;

        // Validate input types
        const updateData = {};
        if (verifiedEntities !== undefined) {
            if (!Number.isInteger(verifiedEntities) || verifiedEntities < 0) {
                return res.status(400).json({ error: 'verifiedEntities must be a non-negative integer' });
            }
            updateData.verifiedEntities = verifiedEntities;
        }
        
        if (dailyTransactions !== undefined) {
            if (!Number.isInteger(dailyTransactions) || dailyTransactions < 0) {
                return res.status(400).json({ error: 'dailyTransactions must be a non-negative integer' });
            }
            updateData.dailyTransactions = dailyTransactions;
        }
        
        if (complianceRules !== undefined) {
            if (!Number.isInteger(complianceRules) || complianceRules < 0) {
                return res.status(400).json({ error: 'complianceRules must be a non-negative integer' });
            }
            updateData.complianceRules = complianceRules;
        }
        
        if (usdToVndRate !== undefined) {
            if (typeof usdToVndRate !== 'number' || usdToVndRate <= 0) {
                return res.status(400).json({ error: 'usdToVndRate must be a positive number' });
            }
            updateData.usdToVndRate = usdToVndRate;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'At least one metric field is required' });
        }

        // Find or create system metrics record
        let systemMetrics = await EvndSystemMetrics.findOne({
            where: { workspaceId }
        });

        if (!systemMetrics) {
            systemMetrics = await EvndSystemMetrics.create({
                workspaceId,
                totalEvndSupply: 0,
                verifiedEntities: 0,
                dailyTransactions: 0,
                complianceRules: 0,
                usdToVndRate: 24000,
                ...updateData
            });
        } else {
            await systemMetrics.update(updateData);
        }

        res.status(200).json({
            success: true,
            message: 'System metrics updated successfully',
            metrics: {
                verifiedEntities: systemMetrics.verifiedEntities,
                dailyTransactions: systemMetrics.dailyTransactions,
                complianceRules: systemMetrics.complianceRules,
                usdToVndRate: systemMetrics.usdToVndRate,
                totalEvndSupply: systemMetrics.totalEvndSupply
            }
        });
    } catch(error) {
        console.error('Error updating system metrics:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get system metrics
 * GET /api/evnd/metrics
 */
router.get('/metrics', workspaceAuthMiddleware, async (req, res, next) => {
    try {
        const workspaceId = req.query.workspace.id;

        let systemMetrics = await EvndSystemMetrics.findOne({
            where: { workspaceId }
        });

        if (!systemMetrics) {
            systemMetrics = await EvndSystemMetrics.create({
                workspaceId,
                totalEvndSupply: 0,
                verifiedEntities: 0,
                dailyTransactions: 0,
                complianceRules: 0,
                usdToVndRate: 24000
            });
        }

        res.status(200).json({
            success: true,
            metrics: {
                verifiedEntities: systemMetrics.verifiedEntities,
                dailyTransactions: systemMetrics.dailyTransactions,
                complianceRules: systemMetrics.complianceRules,
                usdToVndRate: systemMetrics.usdToVndRate,
                totalEvndSupply: systemMetrics.totalEvndSupply
            }
        });
    } catch(error) {
        console.error('Error fetching system metrics:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 