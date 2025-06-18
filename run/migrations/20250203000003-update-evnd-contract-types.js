'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // First, add the new enum values to the contractType column
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_evnd_contracts_contractType" 
            ADD VALUE IF NOT EXISTS 'proxy_admin';
        `);
        
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_evnd_contracts_contractType" 
            ADD VALUE IF NOT EXISTS 'address_restriction_compliance';
        `);
        
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_evnd_contracts_contractType" 
            ADD VALUE IF NOT EXISTS 'verification_compliance';
        `);
        
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_evnd_contracts_contractType" 
            ADD VALUE IF NOT EXISTS 'supply_compliance';
        `);
        
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_evnd_contracts_contractType" 
            ADD VALUE IF NOT EXISTS 'transaction_type_compliance';
        `);
        
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_evnd_contracts_contractType" 
            ADD VALUE IF NOT EXISTS 'entity_type_compliance';
        `);
        
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_evnd_contracts_contractType" 
            ADD VALUE IF NOT EXISTS 'deployer_admin';
        `);
        
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_evnd_contracts_contractType" 
            ADD VALUE IF NOT EXISTS 'verifier_1';
        `);
        
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_evnd_contracts_contractType" 
            ADD VALUE IF NOT EXISTS 'verifier_2';
        `);
        
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_evnd_contracts_contractType" 
            ADD VALUE IF NOT EXISTS 'blacklister_1';
        `);
        
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_evnd_contracts_contractType" 
            ADD VALUE IF NOT EXISTS 'blacklister_2';
        `);
    },

    async down(queryInterface, Sequelize) {
        // Note: PostgreSQL doesn't support removing enum values directly
        // This would require recreating the enum type and updating the column
        // For development purposes, we'll leave this empty
        // In production, you'd need to handle this more carefully
        console.log('Rollback not implemented - PostgreSQL enum values cannot be easily removed');
    }
}; 