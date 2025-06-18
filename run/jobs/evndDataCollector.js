const { ProviderConnector } = require('../lib/rpc');
const { 
    Workspace, 
    EvndSystemComponent, 
    EvndSystemMetrics, 
    EvndVerifier, 
    EvndExchangeMetrics 
} = require('../models');
const logger = require('../lib/logger');
const { enqueue } = require('../lib/queue');
const axios = require('axios');

// ERC20 ABI for token operations
const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

// Exchange rate API URL (you can change this to your preferred provider)
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';

module.exports = async job => {
    const data = job.data;

    if (!data.workspaceId) {
        return 'Missing workspaceId parameter';
    }

    try {
        const workspace = await Workspace.findByPk(data.workspaceId);
        if (!workspace) {
            return 'Invalid workspace';
        }

        const provider = new ProviderConnector(workspace.rpcServer);
        
        // Get all system components for this workspace
        const systemComponents = await EvndSystemComponent.findAll({
            where: { workspaceId: data.workspaceId, isActive: true }
        });

        // Get system metrics record (create if doesn't exist)
        let systemMetrics = await EvndSystemMetrics.findOne({
            where: { workspaceId: data.workspaceId }
        });

        if (!systemMetrics) {
            systemMetrics = await EvndSystemMetrics.create({
                workspaceId: data.workspaceId,
                totalEvndSupply: 0,
                verifiedEntities: 0,
                dailyTransactions: 0,
                complianceRules: 0,
                usdToVndRate: 24000
            });
        }

        // Get exchange metrics record (create if doesn't exist)
        let exchangeMetrics = await EvndExchangeMetrics.findOne({
            where: { workspaceId: data.workspaceId }
        });

        if (!exchangeMetrics) {
            exchangeMetrics = await EvndExchangeMetrics.create({
                workspaceId: data.workspaceId,
                usdToVndRate: 24000,
                rateLastUpdated: new Date(),
                todayInflowVnd: 0,
                todayTransactions: 0,
                monthNetVnd: 0,
                monthTransactions: 0,
                yearNetVnd: 0,
                yearTransactions: 0
            });
        }

        // Update token supply from blockchain
        const evndTokenComponent = systemComponents.find(c => c.componentType === 'evnd_token');
        if (evndTokenComponent) {
            try {
                const totalSupply = await provider.call({
                    to: evndTokenComponent.address,
                    data: '0x18160ddd' // totalSupply() method selector
                });
                
                const supply = parseInt(totalSupply, 16);
                await systemMetrics.update({ totalEvndSupply: supply });
                
                logger.info(`Updated eVND total supply: ${supply}`, { 
                    location: 'jobs.evndDataCollector',
                    workspaceId: data.workspaceId 
                });
            } catch (error) {
                logger.error(`Failed to fetch eVND total supply: ${error.message}`, { 
                    location: 'jobs.evndDataCollector',
                    workspaceId: data.workspaceId,
                    error 
                });
            }
        }

        // Update verified entities count from entity registry
        const entityRegistryComponent = systemComponents.find(c => c.componentType === 'entity_registry');
        if (entityRegistryComponent) {
            try {
                // This would need to be customized based on your entity registry contract
                // For now, we'll get the count from transaction logs or events
                const verifiedCount = await workspace.countActiveWallets();
                await systemMetrics.update({ verifiedEntities: verifiedCount });
            } catch (error) {
                logger.error(`Failed to fetch verified entities count: ${error.message}`, { 
                    location: 'jobs.evndDataCollector',
                    workspaceId: data.workspaceId,
                    error 
                });
            }
        }

        // Update daily transaction count
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dailyTxCount = await workspace.getTransactionCount(today.getTime() / 1000);
            await systemMetrics.update({ dailyTransactions: dailyTxCount });
            await exchangeMetrics.update({ todayTransactions: dailyTxCount });
        } catch (error) {
            logger.error(`Failed to fetch daily transaction count: ${error.message}`, { 
                location: 'jobs.evndDataCollector',
                workspaceId: data.workspaceId,
                error 
            });
        }

        // Update USD to VND exchange rate
        try {
            const response = await axios.get(EXCHANGE_RATE_API, { timeout: 10000 });
            const vndRate = response.data.rates.VND;
            if (vndRate) {
                await systemMetrics.update({ usdToVndRate: vndRate });
                await exchangeMetrics.update({ 
                    usdToVndRate: vndRate,
                    rateLastUpdated: new Date()
                });
                
                logger.info(`Updated USD to VND rate: ${vndRate}`, { 
                    location: 'jobs.evndDataCollector',
                    workspaceId: data.workspaceId 
                });
            }
        } catch (error) {
            logger.error(`Failed to fetch USD to VND exchange rate: ${error.message}`, { 
                location: 'jobs.evndDataCollector',
                workspaceId: data.workspaceId,
                error 
            });
        }

        // Update compliance rules count
        const complianceRegistryComponent = systemComponents.find(c => c.componentType === 'compliance_registry');
        if (complianceRegistryComponent) {
            try {
                // This would be customized based on your compliance registry contract
                // For now, we'll use a default value and increment based on time
                const rulesCount = 5; // You'd fetch this from your compliance contract
                await systemMetrics.update({ complianceRules: rulesCount });
            } catch (error) {
                logger.error(`Failed to fetch compliance rules count: ${error.message}`, { 
                    location: 'jobs.evndDataCollector',
                    workspaceId: data.workspaceId,
                    error 
                });
            }
        }

        // Update exchange metrics with historical data
        try {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const yearStart = new Date(now.getFullYear(), 0, 1);

            // Get monthly transaction volume
            const monthlyTxCount = await workspace.getTransactionCount(monthStart.getTime() / 1000);
            
            // Get yearly transaction volume
            const yearlyTxCount = await workspace.getTransactionCount(yearStart.getTime() / 1000);

            await exchangeMetrics.update({
                monthTransactions: monthlyTxCount,
                yearTransactions: yearlyTxCount,
                // These would be calculated based on actual exchange transactions
                monthNetVnd: monthlyTxCount * 50000, // Mock calculation
                yearNetVnd: yearlyTxCount * 50000,   // Mock calculation
                todayInflowVnd: dailyTxCount * 50000 // Mock calculation
            });

        } catch (error) {
            logger.error(`Failed to update exchange metrics: ${error.message}`, { 
                location: 'jobs.evndDataCollector',
                workspaceId: data.workspaceId,
                error 
            });
        }

        // Schedule next collection (every 5 minutes)
        await enqueue('evndDataCollector', `evndDataCollector-${data.workspaceId}-${Date.now()}`, {
            workspaceId: data.workspaceId
        }, 5, null, 300000); // 5 minutes delay

        return 'eVND data collection completed successfully';

    } catch (error) {
        logger.error(`eVND data collection failed: ${error.message}`, { 
            location: 'jobs.evndDataCollector',
            workspaceId: data.workspaceId,
            error 
        });
        throw error;
    }
}; 