'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create system components table for storing contract addresses
        await queryInterface.createTable('evnd_system_components', {
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
            componentType: {
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

        // Create system metrics table for storing real-time metrics
        await queryInterface.createTable('evnd_system_metrics', {
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
            totalEvndSupply: {
                type: Sequelize.BIGINT,
                allowNull: true
            },
            verifiedEntities: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            dailyTransactions: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            complianceRules: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            usdToVndRate: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
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

        // Create verifiers table for storing authorized verifier addresses
        await queryInterface.createTable('evnd_verifiers', {
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
            address: {
                type: Sequelize.STRING(42),
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive', 'suspended'),
                defaultValue: 'active'
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

        // Create exchange portal metrics table for exchange-specific data
        await queryInterface.createTable('evnd_exchange_metrics', {
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
            usdToVndRate: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            rateLastUpdated: {
                type: Sequelize.DATE,
                allowNull: false
            },
            todayInflowVnd: {
                type: Sequelize.BIGINT,
                defaultValue: 0
            },
            todayTransactions: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            monthNetVnd: {
                type: Sequelize.BIGINT,
                defaultValue: 0
            },
            monthTransactions: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            yearNetVnd: {
                type: Sequelize.BIGINT,
                defaultValue: 0
            },
            yearTransactions: {
                type: Sequelize.INTEGER,
                defaultValue: 0
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

        // Add indexes for better performance
        await queryInterface.addIndex('evnd_system_components', ['workspaceId', 'componentType']);
        await queryInterface.addIndex('evnd_system_components', ['address']);
        await queryInterface.addIndex('evnd_verifiers', ['workspaceId', 'status']);
        await queryInterface.addIndex('evnd_verifiers', ['address']);
        await queryInterface.addIndex('evnd_system_metrics', ['workspaceId']);
        await queryInterface.addIndex('evnd_exchange_metrics', ['workspaceId']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('evnd_exchange_metrics');
        await queryInterface.dropTable('evnd_verifiers');
        await queryInterface.dropTable('evnd_system_metrics');
        await queryInterface.dropTable('evnd_system_components');
    }
}; 