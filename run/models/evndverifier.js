'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class EvndVerifier extends Model {
        static associate(models) {
            EvndVerifier.belongsTo(models.Workspace, { 
                foreignKey: 'workspaceId', 
                as: 'workspace' 
            });
        }
    }

    EvndVerifier.init({
        workspaceId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING(42),
            allowNull: false,
            validate: {
                is: /^0x[a-fA-F0-9]{40}$/
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended'),
            defaultValue: 'active'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'EvndVerifier',
        tableName: 'evnd_verifiers',
        indexes: [
            {
                fields: ['workspaceId', 'status']
            },
            {
                fields: ['address']
            }
        ]
    });

    return EvndVerifier;
}; 