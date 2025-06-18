const { Workspace, EvndSystemComponent, EvndSystemMetrics, EvndExchangeMetrics } = require('../models');
const { enqueue } = require('../lib/queue');
const logger = require('../lib/logger');

module.exports = async job => {
    const data = job.data;

    if (!data.workspaceId) {
        return 'Missing workspaceId parameter';
    }

    try {
        const workspace = await Workspace.findByPk(data.workspaceId);
        if (!workspace) {
            return 'Invalid workspace';
        }

        // Check if system components exist for this workspace
        const componentsCount = await EvndSystemComponent.count({
            where: { workspaceId: data.workspaceId }
        });

        if (componentsCount === 0) {
            logger.info(`No eVND system components found for workspace ${data.workspaceId}. Skipping data collection.`);
            return 'No eVND system components configured';
        }

        // Start the data collection job
        await enqueue('evndDataCollector', `evndDataCollector-${data.workspaceId}-initial`, {
            workspaceId: data.workspaceId
        }, 5); // High priority for initial collection

        logger.info(`Started eVND data collection for workspace ${data.workspaceId}`, {
            location: 'jobs.startEvndDataCollection',
            workspaceId: data.workspaceId
        });

        return 'eVND data collection started successfully';

    } catch (error) {
        logger.error(`Failed to start eVND data collection: ${error.message}`, {
            location: 'jobs.startEvndDataCollection',
            workspaceId: data.workspaceId,
            error
        });
        throw error;
    }
}; 