const { Explorer } = require('../models');
const { bulkEnqueue } = require('../lib/queue');

module.exports = async () => {
    const explorers = await Explorer.findAll();

    const jobs = explorers.map(e => ({
        name: `updateExplorerSyncingProcess-${e.id}`,
        data: { explorerSlug: e.slug }
    }));

    console.log(`Enqueuing ${jobs.length} jobs to update explorer syncing process...`);

    await bulkEnqueue('updateExplorerSyncingProcess', jobs);

    return true;
};
