'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class EvndExchangeMetrics extends Model {
        static associate(models) {
            EvndExchangeMetrics.belongsTo(models.Workspace, { 
                foreignKey: 'workspaceId', 
                as: 'workspace' 
            });
        }
    }

    EvndExchangeMetrics.init({
        workspaceId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        usdToVndRate: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        rateLastUpdated: {
            type: DataTypes.DATE,
            allowNull: false
        },
        todayInflowVnd: {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        todayTransactions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        monthNetVnd: {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        monthTransactions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        yearNetVnd: {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        yearTransactions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'EvndExchangeMetrics',
        tableName: 'evnd_exchange_metrics',
        indexes: [
            {
                fields: ['workspaceId']
            }
        ]
    });

    return EvndExchangeMetrics;
}; 