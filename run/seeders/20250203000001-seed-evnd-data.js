'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Find the first available workspace ID
        const workspaces = await queryInterface.sequelize.query(
            'SELECT id FROM workspaces ORDER BY id LIMIT 1',
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (workspaces.length === 0) {
            console.log('No workspaces found. Skipping eVND seeder.');
            return;
        }

        const WORKSPACE_ID = workspaces[0].id;
        console.log(`Using workspace ID ${WORKSPACE_ID} for eVND seeder`);

        // Check if data already exists
        const existingComponents = await queryInterface.sequelize.query(
            'SELECT COUNT(*) as count FROM evnd_system_components WHERE "workspaceId" = :workspaceId',
            { 
                replacements: { workspaceId: WORKSPACE_ID },
                type: Sequelize.QueryTypes.SELECT 
            }
        );

        if (existingComponents[0].count > 0) {
            console.log('eVND system components already exist. Skipping seeder.');
            return;
        }

        // Seed system components
        await queryInterface.bulkInsert('evnd_system_components', [
            {
                workspaceId: WORKSPACE_ID,
                componentType: 'evnd_token',
                name: 'e-VND Token',
                address: '0xDc6454B9F2F83b2A0F4b30D3C1c33F30c2C6C9',
                icon: '💰',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                workspaceId: WORKSPACE_ID,
                componentType: 'exchange_portal',
                name: 'Exchange Portal',
                address: '0x0B30a94F3E0b72A8D89cFF0F6C1c7016',
                icon: '🔄',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                workspaceId: WORKSPACE_ID,
                componentType: 'entity_registry',
                name: 'Entity Registry',
                address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
                icon: '📋',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                workspaceId: WORKSPACE_ID,
                componentType: 'compliance_registry',
                name: 'Compliance Registry',
                address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
                icon: '⚖️',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                workspaceId: WORKSPACE_ID,
                componentType: 'musd',
                name: 'mUSD',
                address: '0x9A6743acD9A1C8e8a2B67e72f3d3a4C2c3c7508',
                icon: '💵',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        // Seed verifiers
        await queryInterface.bulkInsert('evnd_verifiers', [
            {
                workspaceId: WORKSPACE_ID,
                address: '0x7099B1E00D8b9aaEc2A87AaE0b1eA9Be79C8',
                name: 'Ministry of Finance',
                status: 'active',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                workspaceId: WORKSPACE_ID,
                address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                name: 'State Bank Vietnam',
                status: 'active',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        // Seed initial metrics
        await queryInterface.bulkInsert('evnd_system_metrics', [
            {
                workspaceId: WORKSPACE_ID,
                totalEvndSupply: 1000000000,
                verifiedEntities: 1247,
                dailyTransactions: 12450,
                complianceRules: 5,
                usdToVndRate: 24000.00,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        // Seed exchange metrics
        await queryInterface.bulkInsert('evnd_exchange_metrics', [
            {
                workspaceId: WORKSPACE_ID,
                usdToVndRate: 24000.00,
                rateLastUpdated: new Date(),
                todayInflowVnd: 125000000,
                todayTransactions: 2340,
                monthNetVnd: 2100000000,
                monthTransactions: 45600,
                yearNetVnd: 12500000000,
                yearTransactions: 891200,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('evnd_exchange_metrics', null, {});
        await queryInterface.bulkDelete('evnd_system_metrics', null, {});
        await queryInterface.bulkDelete('evnd_verifiers', null, {});
        await queryInterface.bulkDelete('evnd_system_components', null, {});
    }
}; 