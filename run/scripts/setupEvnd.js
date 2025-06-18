#!/usr/bin/env node

const { 
    sequelize, 
    Workspace, 
    EvndSystemComponent, 
    EvndSystemMetrics, 
    EvndVerifier, 
    EvndExchangeMetrics 
} = require('../models');

async function createTables() {
    try {
        console.log('🚀 Creating eVND tables...');
        
        // Create tables using the models
        await EvndSystemComponent.sync({ force: false });
        await EvndSystemMetrics.sync({ force: false });
        await EvndVerifier.sync({ force: false });
        await EvndExchangeMetrics.sync({ force: false });
        
        console.log('✅ Tables created successfully!');
        return true;
    } catch (error) {
        console.error('❌ Table creation failed:', error.message);
        return false;
    }
}

async function setupEvnd() {
    try {
        // First create tables
        const tablesCreated = await createTables();
        if (!tablesCreated) {
            return;
        }
        
        // Check available workspaces
        const workspaces = await Workspace.findAll({ 
            attributes: ['id', 'name'],
            limit: 5 
        });
        
        if (workspaces.length === 0) {
            console.log('⚠️  No workspaces found in the database.');
            console.log('   Create a workspace first, then run this script again.');
            return;
        }
        
        console.log('\n📋 Available workspaces:');
        workspaces.forEach(ws => {
            console.log(`   - ID: ${ws.id}, Name: ${ws.name}`);
        });
        
        // Get workspace ID from command line or use first available
        const workspaceId = process.argv[2] || workspaces[0].id;
        const selectedWorkspace = workspaces.find(ws => ws.id == workspaceId) || workspaces[0];
        
        console.log(`\n🏗️  Setting up eVND for workspace: ${selectedWorkspace.name} (ID: ${selectedWorkspace.id})`);
        
        // Check if already set up
        const existingComponents = await EvndSystemComponent.count({
            where: { workspaceId: selectedWorkspace.id }
        });
        
        if (existingComponents > 0) {
            console.log('ℹ️  eVND system already set up for this workspace.');
            console.log('   Use the API to update configuration if needed.');
            return;
        }
        
        // Set up system components
        const components = [
            {
                componentType: 'evnd_token',
                name: 'e-VND Token',
                address: '0xDc6454B9F2F83b2A0F4b30D3C1c33F30c2C6C9',
                icon: '💰'
            },
            {
                componentType: 'exchange_portal',
                name: 'Exchange Portal',
                address: '0x0B30a94F3E0b72A8D89cFF0F6C1c7016',
                icon: '🔄'
            },
            {
                componentType: 'entity_registry',
                name: 'Entity Registry',
                address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
                icon: '📋'
            },
            {
                componentType: 'compliance_registry',
                name: 'Compliance Registry',
                address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
                icon: '⚖️'
            },
            {
                componentType: 'musd',
                name: 'mUSD',
                address: '0x9A6743acD9A1C8e8a2B67e72f3d3a4C2c3c7508',
                icon: '💵'
            }
        ];
        
        for (const component of components) {
            await EvndSystemComponent.create({
                workspaceId: selectedWorkspace.id,
                ...component,
                isActive: true
            });
            console.log(`✓ Created ${component.name}`);
        }
        
        // Set up verifiers
        const verifiers = [
            {
                address: '0x7099B1E00D8b9aaEc2A87AaE0b1eA9Be79C8',
                name: 'Ministry of Finance'
            },
            {
                address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                name: 'State Bank Vietnam'
            }
        ];
        
        for (const verifier of verifiers) {
            await EvndVerifier.create({
                workspaceId: selectedWorkspace.id,
                ...verifier,
                status: 'active',
                isActive: true
            });
            console.log(`✓ Created verifier ${verifier.name}`);
        }
        
        // Initialize metrics
        await EvndSystemMetrics.create({
            workspaceId: selectedWorkspace.id,
            totalEvndSupply: 1000000000,
            verifiedEntities: 1247,
            dailyTransactions: 12450,
            complianceRules: 5,
            usdToVndRate: 24000
        });
        console.log('✓ Initialized system metrics');
        
        await EvndExchangeMetrics.create({
            workspaceId: selectedWorkspace.id,
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
        
        console.log('\n🎉 eVND system setup completed successfully!');
        console.log('\n📊 You can now access the dashboard:');
        console.log(`   GET /api/evnd/dashboard`);
        console.log('\n🔄 To start data collection:');
        console.log(`   POST /api/evnd/start-collection`);
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.error(error.stack);
    } finally {
        await sequelize.close();
    }
}

if (require.main === module) {
    setupEvnd();
}

module.exports = { setupEvnd }; 