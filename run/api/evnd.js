const express = require('express');
const router = express.Router();
const workspaceAuthMiddleware = require('../middlewares/workspaceAuth');

/**
 * Get eVND dashboard data
 * Returns system status information for eVND token dashboard
 */
router.get('/dashboard', workspaceAuthMiddleware, async (req, res, next) => {
    try {
        // Mock data based on the screenshot requirements
        const dashboardData = {
            systemStatus: 'VIETNAM e-VND CBDC SYSTEM STATUS',
            systemComponents: {
                evndToken: {
                    name: 'e-VND Token',
                    icon: '💰',
                    address: '0xDc64...C6C9',
                    fullAddress: '0xDc6454B9F2F83b2A0F4b30D3C1c33F30c2C6C9'
                },
                exchangePortal: {
                    name: 'Exchange Portal',
                    icon: '🔄',
                    address: '0x0B30...7016',
                    fullAddress: '0x0B30a94F3E0b72A8D89cFF0F6C1c7016'
                },
                entityRegistry: {
                    name: 'Entity Registry',
                    icon: '📋',
                    address: '0x5FbD...0aa3',
                    fullAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
                },
                complianceRegistry: {
                    name: 'Compliance Registry',
                    icon: '⚖️',
                    address: '0xCf7E...0Fc9',
                    fullAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
                },
                mUSD: {
                    name: 'mUSD',
                    icon: '💵',
                    address: '0x9A67...7508',
                    fullAddress: '0x9A6743acD9A1C8e8a2B67e72f3d3a4C2c3c7508'
                }
            },
            systemMetrics: {
                totalEvndSupply: {
                    label: 'Total e-VND Supply',
                    value: '1,000,000,000 VND',
                    rawValue: 1000000000
                },
                verifiedEntities: {
                    label: 'Verified Entities',
                    value: '1,247 verified',
                    rawValue: 1247
                },
                dailyTransactions: {
                    label: 'Daily Transactions',
                    value: '12,450',
                    rawValue: 12450
                },
                complianceRules: {
                    label: 'Compliance Rules',
                    value: '5 active',
                    rawValue: 5
                },
                exchangeRate: {
                    label: 'Exchange Rate',
                    value: '1 USD = 24,000 VND',
                    usdToVnd: 24000
                }
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
                    today: {
                        inflow: '+125M e-VND inflow',
                        transactions: '2,340 transactions'
                    },
                    thisMonth: {
                        net: '+2.1B e-VND net',
                        transactions: '45,600 transactions'
                    },
                    thisYear: {
                        net: '+12.5B e-VND net',
                        transactions: '891,200 transactions'
                    }
                }
            }
        };

        res.status(200).json(dashboardData);
    } catch(error) {
        console.error('Error fetching eVND dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 