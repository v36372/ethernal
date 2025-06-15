'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('evnd_contracts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            workspaceId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'workspaces',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            contractType: {
                type: Sequelize.ENUM('evnd_token', 'exchange_portal', 'entity_registry', 'compliance_registry', 'musd'),
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            address: {
                type: Sequelize.STRING(42),
                allowNull: false
            },
            icon: {
                type: Sequelize.STRING,
                allowNull: true
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Add unique constraint for workspace + contract type
        await queryInterface.addConstraint('evnd_contracts', {
            fields: ['workspaceId', 'contractType'],
            type: 'unique',
            name: 'evnd_contracts_workspace_type_unique'
        });

        // Add index for better performance
        await queryInterface.addIndex('evnd_contracts', ['workspaceId']);
        await queryInterface.addIndex('evnd_contracts', ['address']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('evnd_contracts');
    }
}; 