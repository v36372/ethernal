'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class EvndContract extends Model {
        static associate(models) {
            EvndContract.belongsTo(models.Workspace, { 
                foreignKey: 'workspaceId', 
                as: 'workspace' 
            });
        }
    }

    EvndContract.init({
        workspaceId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        contractType: {
            type: DataTypes.ENUM(
                'evnd_token', 
                'exchange_portal', 
                'entity_registry', 
                'compliance_registry', 
                'musd',
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
            ),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING(42),
            allowNull: false,
            validate: {
                is: /^0x[a-fA-F0-9]{40}$/
            }
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'EvndContract',
        tableName: 'evnd_contracts',
        indexes: [
            {
                unique: true,
                fields: ['workspaceId', 'contractType']
            },
            {
                fields: ['workspaceId']
            },
            {
                fields: ['address']
            }
        ]
    });

    return EvndContract;
}; 