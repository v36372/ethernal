const { Explorer, Workspace, RpcHealthCheck, StripeSubscription, StripePlan } = require('../models');
const PM2 = require('../lib/pm2');

module.exports = async job => {
    const data = job.data;
    console.log(`[DEBUG] Running updateExplorerSyncingProcess job with data: ${JSON.stringify(data)}`);

    if (!data.explorerSlug)
        return 'Missing parameter.';

    const explorer = await Explorer.findOne({
        where: { slug: data.explorerSlug },
        include: [
            {
                model: Workspace,
                as: 'workspace',
                include: {
                    model: RpcHealthCheck,
                    as: 'rpcHealthCheck'
                }
            },
            {
                model: StripeSubscription,
                as: 'stripeSubscription',
                include: {
                    model: StripePlan,
                    as: 'stripePlan'
                }
            }
        ]
    });

    try {
        console.log(`[DEBUG] Updating syncing process for explorer: ${data.explorerSlug}`);

        const pm2 = new PM2(process.env.PM2_HOST, process.env.PM2_SECRET);
        const { data: existingProcess } = await pm2.find(data.explorerSlug);

        if (data.reset) {
            await pm2.reset(explorer.slug, explorer.workspaceId);
            console.log(`[DEBUG] Process reset for explorer: ${data.explorerSlug}`);
            return 'Process reset.';
        }
        else if (!explorer && existingProcess) {
            await pm2.delete(data.explorerSlug);
            console.log(`[DEBUG] Process deleted for explorer: ${data.explorerSlug}`);
            return 'Process deleted: no explorer.';
        }
        else if (!explorer && !existingProcess) {
            console.log(`[DEBUG] No process change for explorer: ${data.explorerSlug}`);
            return 'No process change.';
        }
        // Remove subscription check - always allow syncing processes
        // else if (explorer && !explorer.stripeSubscription) {
        //     await pm2.delete(explorer.slug);
        //     return 'Process deleted: no subscription.';
        // }
        else if (explorer.workspace.rpcHealthCheck && !explorer.workspace.rpcHealthCheck.isReachable && existingProcess) {
            await pm2.delete(explorer.slug);
            console.log(`[DEBUG] Process deleted for explorer: ${data.explorerSlug} - RPC is not reachable.`);
            return 'Process deleted: RPC is not reachable.';
        }
        else if (!explorer.shouldSync && existingProcess) {
            await pm2.delete(explorer.slug);
            console.log(`[DEBUG] Process deleted for explorer: ${data.explorerSlug} - sync is disabled.`);
            return 'Process deleted: sync is disabled.';
        }
        // Remove transaction quota check - always allow syncing processes
        // else if (await explorer.hasReachedTransactionQuota()) {
        //     await pm2.delete(explorer.slug);
        //     return 'Process deleted: transaction quota reached.';
        // }
        else if (explorer.shouldSync && !existingProcess) {
            await pm2.start(explorer.slug, explorer.workspaceId);
            console.log(`[DEBUG] Process started for explorer: ${data.explorerSlug}`);
            return 'Process started.';
        }
        else if (explorer.shouldSync && existingProcess && existingProcess.pm2_env.status == 'stopped') {
            await pm2.resume(explorer.slug, explorer.workspaceId);
            console.log(`[DEBUG] Process resumed for explorer: ${data.explorerSlug}`);
            return 'Process resumed.';
        }
        else {
            console.log(`[DEBUG] No process change for explorer: ${data.explorerSlug}`);
            return 'No process change.';
        }
    } catch(error) {
        if (error.message.startsWith('Timed out after'))
            return 'Timed out';
        else
            throw error;
    }
};
