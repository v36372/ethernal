'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class EvndSystemComponent extends Model {
        static associate(models) {
            EvndSystemComponent.belongsTo(models.Workspace, { 
                foreignKey: 'workspaceId', 
                as: 'workspace' 
            });
        }
    }

    EvndSystemComponent.init({
        workspaceId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        componentType: {
            type: DataTypes.ENUM('evnd_token', 'exchange_portal', 'entity_registry', 'compliance_registry', 'musd'),
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
        modelName: 'EvndSystemComponent',
        tableName: 'evnd_system_components',
        indexes: [
            {
                fields: ['workspaceId', 'componentType']
            },
            {
                fields: ['address']
            }
        ]
    });

    return EvndSystemComponent;
}; 