const { TokenTransfer, Workspace, Transaction } = require('../models');
const { getBalanceChange } = require('../lib/rpc');
const logger = require('../lib/logger');

module.exports = async job => {
    const data = job.data;
    
    console.log(`[DEBUG] processTokenTransfer - Starting processing for tokenTransferId: ${data.tokenTransferId}`);

    if (!data.tokenTransferId)
        return 'Missing parameter.';

    const tokenTransfer = await TokenTransfer.findByPk(data.tokenTransferId, {
        attributes: ['id', 'src', 'dst', 'token', 'transactionId', 'workspaceId'],
        include: [
            {
                model: Workspace,
                as: 'workspace',
                attributes: ['id', 'name', 'public', 'rpcServer']
            },
            {
                model: Transaction,
                as: 'transaction',
                attributes: ['id', 'blockNumber']
            }
        ]
    });

    if (!tokenTransfer) {
        console.log(`[DEBUG] processTokenTransfer - Cannot find token transfer with ID: ${data.tokenTransferId}`);
        return 'Cannot find token transfer';
    }

    console.log(`[DEBUG] processTokenTransfer - Token transfer found: src=${tokenTransfer.src}, dst=${tokenTransfer.dst}, token=${tokenTransfer.token}, workspace.public=${tokenTransfer.workspace.public}`);

    // Always process token transfers regardless of workspace public status
    // if (!tokenTransfer.workspace.public) {
    //     console.log(`[DEBUG] processTokenTransfer - Skipping private workspace: ${tokenTransfer.workspace.name}`);
    //     return 'Not processing private workspaces';
    // }

    if (!tokenTransfer.transaction) {
        console.log(`[DEBUG] processTokenTransfer - Could not find transaction for token transfer ${data.tokenTransferId}`);
        return 'Could not find transaction';
    }

    const workspace = tokenTransfer.workspace;
    const transaction = tokenTransfer.transaction;

    console.log(`[DEBUG] processTokenTransfer - Processing balance changes for block ${transaction.blockNumber}`);
    const changes = [];

    if (tokenTransfer.src != '0x0000000000000000000000000000000000000000') {
        console.log(`[DEBUG] processTokenTransfer - Processing source balance change: ${tokenTransfer.src}`);
        try {
            const balanceChange = await getBalanceChange(tokenTransfer.src, tokenTransfer.token, transaction.blockNumber, workspace.rpcServer);
            console.log(`[DEBUG] processTokenTransfer - Source balance change result:`, balanceChange);
            if (balanceChange && balanceChange.diff != '0') {
                changes.push(balanceChange);
                console.log(`[DEBUG] processTokenTransfer - Added source balance change to queue`);
            }
        } catch(error) {
            console.log(`[DEBUG] processTokenTransfer - Error processing source balance:`, error.message);
            if (error.message && error.message.startsWith('missing revert data in call exception')) {
                logger.error(error.message, { location: 'jobs.processTokenTransfer', error: error, data });
                return error.message;
            }
        }
    }

    if (tokenTransfer.dst != '0x0000000000000000000000000000000000000000') {
        console.log(`[DEBUG] processTokenTransfer - Processing destination balance change: ${tokenTransfer.dst}`);
        try {
            const balanceChange = await getBalanceChange(tokenTransfer.dst, tokenTransfer.token, transaction.blockNumber, workspace.rpcServer);
            console.log(`[DEBUG] processTokenTransfer - Destination balance change result:`, balanceChange);
            if (balanceChange && balanceChange.diff != '0') {
                changes.push(balanceChange);
                console.log(`[DEBUG] processTokenTransfer - Added destination balance change to queue`);
            }
        } catch(error) {
            console.log(`[DEBUG] processTokenTransfer - Error processing destination balance:`, error.message);
            if (error.message && error.message.startsWith('missing revert data in call exception')) {
                logger.error(error.message, { location: 'jobs.processTokenTransfer', error: error, data });
                return error.message;
            }
        }
    }

    console.log(`[DEBUG] processTokenTransfer - Total balance changes to process: ${changes.length}`);
    for (let i = 0; i < changes.length; i++) {
        console.log(`[DEBUG] processTokenTransfer - Creating balance change ${i+1}:`, changes[i]);
        await tokenTransfer.safeCreateBalanceChange(changes[i]);
    }

    console.log(`[DEBUG] processTokenTransfer - Successfully processed token transfer ${data.tokenTransferId}`);
    return true;
};
