const { TokenTransfer, EvndContract, Workspace } = require('../models');
const { enqueue } = require('../lib/queue');

async function triggerTokenProcessing(workspaceId) {
    try {
        console.log(`\n=== Triggering Token Processing for Workspace ${workspaceId} ===\n`);

        // Get workspace
        const workspace = await Workspace.findByPk(workspaceId);
        if (!workspace) {
            throw new Error('Workspace not found');
        }

        console.log(`Workspace: ${workspace.name} (Public: ${workspace.public})`);

        // Get eVND contract
        const evndContract = await EvndContract.findOne({
            where: {
                workspaceId,
                contractType: 'evnd_token',
                isActive: true
            }
        });

        if (!evndContract) {
            throw new Error('No eVND contract found');
        }

        console.log(`eVND Token: ${evndContract.address}`);

        // Find unprocessed token transfers
        const unprocessedTransfers = await TokenTransfer.findAll({
            where: {
                workspaceId,
                token: evndContract.address.toLowerCase()
            },
            include: [{
                model: require('../models').TokenBalanceChange,
                as: 'tokenBalanceChanges',
                required: false
            }]
        });

        const transfersNeedingProcessing = unprocessedTransfers.filter(
            transfer => transfer.tokenBalanceChanges.length === 0
        );

        console.log(`Found ${transfersNeedingProcessing.length} transfers needing processing`);

        if (transfersNeedingProcessing.length === 0) {
            console.log('✅ All transfers are already processed');
            return;
        }

        // Queue processing jobs
        let queued = 0;
        for (const transfer of transfersNeedingProcessing) {
            try {
                await enqueue('processTokenTransfer', 
                    `processTokenTransfer-${workspaceId}-${transfer.token}-${transfer.id}`, {
                        tokenTransferId: transfer.id
                    }
                );
                queued++;
                console.log(`✅ Queued transfer ${transfer.id}: ${transfer.src} -> ${transfer.dst}`);
            } catch (error) {
                console.log(`❌ Failed to queue transfer ${transfer.id}: ${error.message}`);
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Transfers found: ${unprocessedTransfers.length}`);
        console.log(`   Needing processing: ${transfersNeedingProcessing.length}`);
        console.log(`   Successfully queued: ${queued}`);

        if (queued > 0) {
            console.log(`\n⏳ Jobs have been queued for processing.`);
            console.log(`   Make sure workers are running: node workers/mediumPriority.js`);
            console.log(`   Check progress in a few minutes with the test script.`);
        }

    } catch (error) {
        console.error('Failed to trigger processing:', error);
        throw error;
    }
}

// CLI usage
if (require.main === module) {
    const workspaceId = process.argv[2];
    if (!workspaceId) {
        console.log('Usage: node scripts/triggerTokenProcessing.js <workspaceId>');
        process.exit(1);
    }

    triggerTokenProcessing(parseInt(workspaceId))
        .then(() => {
            console.log('Trigger completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Trigger failed:', error);
            process.exit(1);
        });
}

module.exports = triggerTokenProcessing; 