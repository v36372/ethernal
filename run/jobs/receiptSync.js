const { ProviderConnector } = require('../lib/rpc');
const { Workspace, Explorer, StripeSubscription, Transaction, TransactionReceipt, RpcHealthCheck } = require('../models');
const { processRawRpcObject } = require('../lib/utils');
const { enqueue } = require('../lib/queue');
const RateLimiter = require('../lib/rateLimiter');
const logger = require('../lib/logger');

module.exports = async job => {
    const data = job.data;

    console.log(`[DEBUG] receiptSync - Received job data:`, data);

    if (!data.transactionHash || !data.workspaceId)
        return 'Missing parameter'

    console.log(`[DEBUG] receiptSync - Processing transactionHash: ${data.transactionHash}, workspaceId: ${data.workspaceId}`);

    const include = [
        {
            model: Workspace,
            as: 'workspace',
            attributes: ['id', 'rpcServer', 'rateLimitInterval', 'rateLimitMaxInInterval', 'public', 'rpcHealthCheckEnabled'],
            include: [
                {
                    model: Explorer,
                    as: 'explorer',
                    attributes: ['id', 'shouldSync'],
                    include: {
                        model: StripeSubscription,
                        as: 'stripeSubscription',
                        attributes: ['id']
                    }
                },
                {
                    model: RpcHealthCheck,
                    as: 'rpcHealthCheck',
                    attributes: ['isReachable']
                }
            ]
        },
        {
            model: TransactionReceipt,
            as: 'receipt',
            attributes: ['id']
        }
    ];

    console.log(`[DEBUG] receiptSync - Starting processing for transactionHash: ${data.transactionHash} in workspaceId: ${data.workspaceId}`);

    const transaction = data.transactionId ?
        await Transaction.findByPk(data.transactionId, { include }) :
        await Transaction.findOne({
            where: {
                hash: data.transactionHash,
                workspaceId: data.workspaceId
            },
            include
        });


    if (!transaction)
        return 'Missing transaction';

    console.log(`[DEBUG] receiptSync - Transaction found: ${transaction.hash}, workspaceId: ${transaction.workspaceId}`);

    if (transaction.receipt)
        return 'Receipt has already been synced';

    console.log(`[DEBUG] receiptSync - Processing receipt for transaction: ${transaction.hash}`);

    if (!transaction.workspace)
        return 'Missing workspace';

    console.log(`[DEBUG] receiptSync - Workspace found: ${transaction.workspace.id}, public: ${transaction.workspace.public}`);

    const workspace = transaction.workspace;

    // Always sync receipts regardless of workspace public status
    // if (!workspace.public)
    //     return 'Cannot sync on private workspace';

    if (!workspace.explorer)
        return 'Inactive explorer';

    console.log(`[DEBUG] receiptSync - Explorer found: ${workspace.explorer.id}, shouldSync: ${workspace.explorer.shouldSync}`);

    if (!workspace.explorer.shouldSync)
        return 'Disabled sync';

    console.log(`[DEBUG] receiptSync - RPC server: ${workspace.rpcServer}`);

    if (workspace.rpcHealthCheck && workspace.rpcHealthCheckEnabled && !workspace.rpcHealthCheck.isReachable)
        return 'RPC is unreachable';

    console.log(`[DEBUG] receiptSync - RPC health check enabled: ${workspace.rpcHealthCheckEnabled}, isReachable: ${workspace.rpcHealthCheck ? workspace.rpcHealthCheck.isReachable : 'N/A'}`);

    if (!workspace.explorer.stripeSubscription)
        return 'No active subscription';

    console.log(`[DEBUG] receiptSync - Active subscription found: ${workspace.explorer.stripeSubscription.id}`);

    let limiter;
    if (data.rateLimited && workspace.rateLimitInterval && workspace.rateLimitMaxInInterval)
        limiter = new RateLimiter(workspace.id, workspace.rateLimitInterval, workspace.rateLimitMaxInInterval);

    const providerConnector = new ProviderConnector(workspace.rpcServer, limiter);

    try {
        let receipt;
        try {
            receipt = await providerConnector.fetchTransactionReceipt(transaction.hash);
        } catch(error) {
            const priority = job.opts.priority || (data.source == 'cli-light' ? 1 : 10);
            if (error.message == 'Rate limited') {
                return enqueue('receiptSync', `receiptSync-${workspace.id}-${transaction.hash}-${Date.now()}`, {
                    transactionId: transaction.id,
                    transactionHash: transaction.hash,
                    workspaceId: workspace.id,
                    source: data.source,
                    rateLimited: !!data.rateLimited
                }, priority, null, workspace.rateLimitInterval, !!data.rateLimited);
            }
            else if (error.message.startsWith('Timed out after')) {
                return enqueue('receiptSync', `receiptSync-${workspace.id}-${transaction.hash}-${Date.now()}`, {
                    transactionId: transaction.id,
                    transactionHash: transaction.hash,
                    workspaceId: workspace.id,
                    source: data.source,
                    rateLimited: !!data.rateLimited
                }, priority, null, workspace.rateLimitInterval || 5000, !!data.rateLimited);
            }
            else
                throw error;
        }

        if (!receipt)
            throw new Error('Failed to fetch receipt');

        const processedReceipt = processRawRpcObject(
            receipt,
            Object.keys(TransactionReceipt.rawAttributes).concat(['logs']),
        );

        return transaction.safeCreateReceipt(processedReceipt);
    } catch(error) {
        logger.error(error.message, { location: 'jobs.receiptSync', error, data });
        // await db.incrementFailedAttempts(transaction.workspace.id);
        throw error;
    }
};
