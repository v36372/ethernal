#!/usr/bin/env node

const path = require('path');
const { Sequelize } = require('sequelize');

// Load database config
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database.js')[env];

// Create sequelize instance
let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

async function runMigration() {
    try {
        console.log('🚀 Running eVND system migration...');
        
        // Import and run the migration
        const migration = require('../migrations/20250203000001-create-evnd-system-tables.js');
        await migration.up(sequelize.getQueryInterface(), Sequelize);
        
        console.log('✅ Migration completed successfully!');
        
        // Check if there are workspaces available
        const workspaces = await sequelize.query(
            'SELECT id, name FROM workspaces ORDER BY id LIMIT 5',
            { type: Sequelize.QueryTypes.SELECT }
        );
        
        if (workspaces.length === 0) {
            console.log('⚠️  No workspaces found in the database.');
            console.log('   Create a workspace first, then run the setup.');
        } else {
            console.log('\n📋 Available workspaces:');
            workspaces.forEach(ws => {
                console.log(`   - ID: ${ws.id}, Name: ${ws.name}`);
            });
            
            console.log('\n🔧 To set up eVND for a workspace, you can:');
            console.log(`   1. Use the API: POST /api/evnd/setup`);
            console.log(`   2. Use the setup script with workspace ID`);
            
            if (process.argv[2] && process.argv[2] === '--setup') {
                const workspaceId = process.argv[3] || workspaces[0].id;
                console.log(`\n🏗️  Setting up eVND for workspace ID: ${workspaceId}`);
                
                const { setupEvndSystem } = require('../lib/evndSetup');
                await setupEvndSystem(workspaceId);
            }
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        
        if (error.message.includes('relation') && error.message.includes('already exists')) {
            console.log('ℹ️  Tables already exist. Migration skipped.');
        } else {
            process.exit(1);
        }
    } finally {
        await sequelize.close();
    }
}

if (require.main === module) {
    runMigration();
}

module.exports = { runMigration }; 