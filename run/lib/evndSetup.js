const { 
    Workspace, 
    EvndSystemComponent, 
    EvndSystemMetrics, 
    EvndVerifier, 
    EvndExchangeMetrics 
} = require('../models');
const { enqueue } = require('./queue');
const logger = require('./logger');

/**
 * Set up eVND system for a workspace
 * @param {number} workspaceId - The workspace ID to set up eVND for
 * @param {object} config - Configuration object with system component addresses
 */
async function setupEvndSystem(workspaceId, config = {}) {
    try {
        const workspace = await Workspace.findByPk(workspaceId);
        if (!workspace) {
            throw new Error(`Workspace with ID ${workspaceId} not found`);
        }

        console.log(`Setting up eVND system for workspace: ${workspace.name}`);

        // Default configuration with mock addresses
        const defaultConfig = {
            evndToken: {
                address: '0xDc6454B9F2F83b2A0F4b30D3C1c33F30c2C6C9',
                name: 'e-VND Token',
                icon: '💰'
            },
            exchangePortal: {
                address: '0x0B30a94F3E0b72A8D89cFF0F6C1c7016',
                name: 'Exchange Portal',
                icon: '🔄'
            },
            entityRegistry: {
                address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
                name: 'Entity Registry',
                icon: '📋'
            },
            complianceRegistry: {
                address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
                name: 'Compliance Registry',
                icon: '⚖️'
            },
            mUSD: {
                address: '0x9A6743acD9A1C8e8a2B67e72f3d3a4C2c3c7508',
                name: 'mUSD',
                icon: '💵'
            }
        };

        const finalConfig = { ...defaultConfig, ...config };

        // Create or update system components
        for (const [componentType, componentData] of Object.entries(finalConfig)) {
            const dbComponentType = componentType.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
            
            await EvndSystemComponent.upsert({
                workspaceId,
                componentType: dbComponentType,
                name: componentData.name,
                address: componentData.address,
                icon: componentData.icon,
                isActive: true
            });

            console.log(`✓ Set up ${componentData.name} at ${componentData.address}`);
        }

        // Create default verifiers
        const defaultVerifiers = [
            {
                address: '0x7099B1E00D8b9aaEc2A87AaE0b1eA9Be79C8',
                name: 'Ministry of Finance'
            },
            {
                address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                name: 'State Bank Vietnam'
            }
        ];

        for (const verifier of defaultVerifiers) {
            await EvndVerifier.upsert({
                workspaceId,
                address: verifier.address,
                name: verifier.name,
                status: 'active',
                isActive: true
            });

            console.log(`✓ Set up verifier ${verifier.name} at ${verifier.address}`);
        }

        // Initialize system metrics
        await EvndSystemMetrics.upsert({
            workspaceId,
            totalEvndSupply: 1000000000,
            verifiedEntities: 1247,
            dailyTransactions: 12450,
            complianceRules: 5,
            usdToVndRate: 24000
        });
        console.log('✓ Initialized system metrics');

        // Initialize exchange metrics
        await EvndExchangeMetrics.upsert({
            workspaceId,
            usdToVndRate: 24000,
            rateLastUpdated: new Date(),
            todayInflowVnd: 125000000,
            todayTransactions: 2340,
            monthNetVnd: 2100000000,
            monthTransactions: 45600,
            yearNetVnd: 12500000000,
            yearTransactions: 891200
        });
        console.log('✓ Initialized exchange metrics');

        // Start the data collection worker
        await enqueue('startEvndDataCollection', `startEvndDataCollection-${workspaceId}`, {
            workspaceId
        }, 5);
        console.log('✓ Started eVND data collection worker');

        console.log(`\n🎉 eVND system setup completed for workspace: ${workspace.name}`);
        console.log(`You can now access the dashboard at /api/evnd/dashboard`);

        return {
            success: true,
            message: 'eVND system setup completed successfully',
            workspaceId,
            workspaceName: workspace.name
        };

    } catch (error) {
        logger.error(`eVND setup failed: ${error.message}`, {
            location: 'lib.evndSetup',
            workspaceId,
            error
        });
        throw error;
    }
}

/**
 * Remove eVND system from a workspace
 * @param {number} workspaceId - The workspace ID to remove eVND from
 */
async function removeEvndSystem(workspaceId) {
    try {
        const workspace = await Workspace.findByPk(workspaceId);
        if (!workspace) {
            throw new Error(`Workspace with ID ${workspaceId} not found`);
        }

        console.log(`Removing eVND system from workspace: ${workspace.name}`);

        // Remove all eVND data
        await EvndExchangeMetrics.destroy({ where: { workspaceId } });
        await EvndSystemMetrics.destroy({ where: { workspaceId } });
        await EvndVerifier.destroy({ where: { workspaceId } });
        await EvndSystemComponent.destroy({ where: { workspaceId } });

        console.log('✓ eVND system removed successfully');

        return {
            success: true,
            message: 'eVND system removed successfully',
            workspaceId,
            workspaceName: workspace.name
        };

    } catch (error) {
        logger.error(`eVND removal failed: ${error.message}`, {
            location: 'lib.evndSetup',
            workspaceId,
            error
        });
        throw error;
    }
}

module.exports = {
    setupEvndSystem,
    removeEvndSystem
}; 