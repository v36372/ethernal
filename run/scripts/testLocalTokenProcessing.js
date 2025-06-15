const { Workspace, EvndContract, TokenTransfer, TokenBalanceChange } = require('../models');

async function testLocalTokenProcessing(workspaceId) {
    try {
        console.log(`\n=== Testing Local Development Processing for Workspace ${workspaceId} ===\n`);

        // Get workspace
        const workspace = await Workspace.findByPk(workspaceId);
        if (!workspace) {
            throw new Error('Workspace not found');
        }

        console.log(`Workspace: ${workspace.name}`);
        console.log(`Public: ${workspace.public}`);
        console.log(`RPC Server: ${workspace.rpcServer}`);

        // Check if this is considered local development
        const isLocalDevelopment = workspace.rpcServer && 
            (workspace.rpcServer.includes('localhost') || 
             workspace.rpcServer.includes('127.0.0.1') ||
             workspace.rpcServer.includes('0.0.0.0'));

        console.log(`Is Local Development: ${isLocalDevelopment}`);

        if (!workspace.public && !isLocalDevelopment) {
            console.log('❌ This workspace will NOT process operations');
            console.log('   Reason: Not public and not using localhost RPC');
            return;
        }

        console.log('✅ This workspace WILL process all operations including:');
        console.log('   - Token transfers & balance changes');
        console.log('   - Block processing & analytics');
        console.log('   - Contract processing & pattern detection');
        console.log('   - Transaction tracing');
        console.log('   - Transaction error processing');
        console.log('   - Receipt syncing');
        console.log('   - Integrity checks');

        // Check eVND contract
        const evndContract = await EvndContract.findOne({
            where: {
                workspaceId,
                contractType: 'evnd_token',
                isActive: true
            }
        });

        if (!evndContract) {
            console.log('⚠️  No eVND contract configured');
            console.log('   Run: curl -X POST "http://localhost:3005/api/evnd/contracts/setup-anvil" ...');
            return;
        }

        console.log(`✅ eVND Token: ${evndContract.address}`);

        // Check existing token transfers
        const tokenTransfers = await TokenTransfer.findAll({
            where: {
                workspaceId,
                token: evndContract.address.toLowerCase()
            },
            include: [{
                model: TokenBalanceChange,
                as: 'tokenBalanceChanges',
                required: false
            }],
            limit: 5,
            order: [['id', 'DESC']]
        });

        console.log(`\nFound ${tokenTransfers.length} eVND token transfers:`);

        if (tokenTransfers.length === 0) {
            console.log('   No token transfers found yet');
            console.log('   Make sure you have transactions with eVND token transfers');
        } else {
            let processedCount = 0;
            let unprocessedCount = 0;

            for (const transfer of tokenTransfers) {
                const hasBalanceChanges = transfer.tokenBalanceChanges.length > 0;
                if (hasBalanceChanges) {
                    processedCount++;
                } else {
                    unprocessedCount++;
                }
                
                console.log(`   Transfer ${transfer.id}: ${transfer.src} -> ${transfer.dst}`);
                console.log(`     Amount: ${transfer.amount}`);
                console.log(`     Processed: ${hasBalanceChanges ? '✅' : '❌'}`);
            }

            console.log(`\nSummary:`);
            console.log(`   Processed: ${processedCount}`);
            console.log(`   Unprocessed: ${unprocessedCount}`);

            if (unprocessedCount > 0) {
                console.log(`\n💡 To process unprocessed transfers, you can:`);
                console.log(`   1. Make sure workers are running: node workers/mediumPriority.js`);
                console.log(`   2. Or manually trigger processing via API`);
            }
        }

        console.log(`\n=== Test Complete ===\n`);

    } catch (error) {
        console.error('Test failed:', error);
        throw error;
    }
}

// CLI usage
if (require.main === module) {
    const workspaceId = process.argv[2];
    if (!workspaceId) {
        console.log('Usage: node scripts/testLocalTokenProcessing.js <workspaceId>');
        process.exit(1);
    }

    testLocalTokenProcessing(parseInt(workspaceId))
        .then(() => {
            console.log('Test completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Test failed:', error);
            process.exit(1);
        });
}

module.exports = testLocalTokenProcessing; 