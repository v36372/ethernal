'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class EvndSystemMetrics extends Model {
        static associate(models) {
            EvndSystemMetrics.belongsTo(models.Workspace, { 
                foreignKey: 'workspaceId', 
                as: 'workspace' 
            });
        }
    }

    EvndSystemMetrics.init({
        workspaceId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        totalEvndSupply: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        verifiedEntities: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        dailyTransactions: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        complianceRules: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        usdToVndRate: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'EvndSystemMetrics',
        tableName: 'evnd_system_metrics',
        indexes: [
            {
                fields: ['workspaceId']
            }
        ]
    });

    return EvndSystemMetrics;
}; 