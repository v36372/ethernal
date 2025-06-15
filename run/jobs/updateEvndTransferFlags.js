const { Transaction, EvndContract, TokenTransfer } = require('../models');
const logger = require('../lib/logger');

module.exports = async job => {
    const data = job.data;

    if (!data.workspaceId)
        return 'Missing parameter: workspaceId';

    try {
        // Get the eVND token contract for this workspace
        const evndContract = await EvndContract.findOne({
            where: {
                workspaceId: data.workspaceId,
                contractType: 'evnd_token',
                isActive: true
            }
        });

        if (!evndContract) {
            return 'No active eVND token contract found for workspace';
        }

        logger.info(`Updating eVND transfer flags for workspace ${data.workspaceId}, eVND token: ${evndContract.address}`);

        // Find all transactions that have token transfers involving the eVND token
        const transactionsWithEvndTransfers = await Transaction.findAll({
            where: {
                workspaceId: data.workspaceId,
                isEvndTransfer: false // Only update transactions that haven't been flagged yet
            },
            include: [{
                model: TokenTransfer,
                as: 'tokenTransfers',
                where: {
                    token: evndContract.address.toLowerCase()
                },
                required: true
            }]
        });

        if (transactionsWithEvndTransfers.length === 0) {
            return 'No eVND transactions found to update';
        }

        // Update all found transactions
        const transactionIds = transactionsWithEvndTransfers.map(tx => tx.id);
        const updateResult = await Transaction.update(
            { isEvndTransfer: true },
            {
                where: {
                    id: transactionIds
                }
            }
        );

        logger.info(`Updated ${updateResult[0]} transactions with eVND transfer flags`);
        return `Successfully updated ${updateResult[0]} transactions with eVND transfer flags`;

    } catch (error) {
        logger.error('Error updating eVND transfer flags:', error);
        throw error;
    }
}; 