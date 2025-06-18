const { Transaction, TokenTransfer, TokenBalanceChange, Contract, Workspace, EvndContract, sequelize } = require('../models');

async function debugTokenSync(workspaceId = 1) {
    try {
        console.log(`\n=== Token Sync Debug for Workspace ${workspaceId} ===\n`);

        // 1. Check workspace configuration
        console.log('1. Checking workspace configuration...');
        const workspace = await Workspace.findByPk(workspaceId, {
            include: ['explorer', 'user']
        });

        if (!workspace) {
            console.log('❌ Workspace not found');
            return;
        }

        console.log(`✅ Workspace: ${workspace.name}`);
        console.log(`   Public: ${workspace.public}`);
        console.log(`   RPC Server: ${workspace.rpcServer}`);
        console.log(`   Explorer: ${workspace.explorer ? 'Active' : 'Inactive'}`);
        
        if (workspace.explorer) {
            console.log(`   Should Sync: ${workspace.explorer.shouldSync}`);
        }

        // Check if local development
        const isLocalDevelopment = workspace.rpcServer && 
            (workspace.rpcServer.includes('localhost') || 
             workspace.rpcServer.includes('127.0.0.1') ||
             workspace.rpcServer.includes('0.0.0.0'));
        console.log(`   Is Local Development: ${isLocalDevelopment}`);
        console.log(`   Will Process: ${workspace.public || isLocalDevelopment ? 'YES' : 'NO'}`);

        // 2. Check transactions
        console.log('\n2. Checking transactions...');
        const transactionCount = await Transaction.count({
            where: { workspaceId }
        });
        console.log(`   Total transactions: ${transactionCount}`);

        if (transactionCount === 0) {
            console.log('❌ No transactions found - this is the root issue!');
            console.log('   Make sure you have transactions in your Anvil blockchain');
            console.log('   And that block syncing is working');
            return;
        }

        // Get recent transactions
        const recentTransactions = await Transaction.findAll({
            where: { workspaceId },
            order: [['id', 'DESC']],
            limit: 5,
            attributes: ['id', 'hash', 'from', 'to', 'blockNumber', 'state', 'isEvndTransfer']
        });

        console.log('   Recent transactions:');
        for (const tx of recentTransactions) {
            console.log(`     ${tx.hash}: ${tx.from} -> ${tx.to} (Block: ${tx.blockNumber}, State: ${tx.state}, eVND: ${tx.isEvndTransfer || false})`);
        }

        // 3. Check token contracts
        console.log('\n3. Checking token contracts...');
        const tokenAddresses = [
            '0x09635f643e140090a9a8dcd712ed6285858cebef', // mUSD
            '0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6'  // eVND
        ];

        for (const address of tokenAddresses) {
            const contract = await Contract.findOne({
                where: {
                    workspaceId,
                    address: address.toLowerCase()
                }
            });

            if (contract) {
                console.log(`   ✅ Contract ${address}: ${contract.name || 'Unknown'}`);
                console.log(`      Patterns: ${contract.patterns || 'None'}`);
                console.log(`      Is Token: ${contract.isToken || false}`);
            } else {
                console.log(`   ❌ Contract ${address}: Not found in database`);
            }
        }

        // 4. Check token transfers
        console.log('\n4. Checking token transfers...');
        const tokenTransferCount = await TokenTransfer.count({
            where: { workspaceId }
        });
        console.log(`   Total token transfers: ${tokenTransferCount}`);

        if (tokenTransferCount === 0) {
            console.log('❌ No token transfers found!');
            
            // Check if there are transactions TO token contracts
            const txToTokens = await Transaction.count({
                where: {
                    workspaceId,
                    to: tokenAddresses.map(addr => addr.toLowerCase())
                }
            });
            console.log(`   Transactions to token contracts: ${txToTokens}`);

            if (txToTokens > 0) {
                console.log('   ⚠️  There are transactions to token contracts but no transfers detected');
                console.log('   This suggests token transfer parsing is not working');
            }
        } else {
            const recentTransfers = await TokenTransfer.findAll({
                where: { workspaceId },
                order: [['id', 'DESC']],
                limit: 5,
                attributes: ['id', 'token', 'src', 'dst', 'amount', 'transactionId']
            });

            console.log('   Recent token transfers:');
            for (const transfer of recentTransfers) {
                console.log(`     Transfer ${transfer.id}: ${transfer.src} -> ${transfer.dst}`);
                console.log(`       Token: ${transfer.token}, Amount: ${transfer.amount}`);
            }
        }

        // 5. Check token balance changes
        console.log('\n5. Checking token balance changes...');
        const balanceChangeCount = await TokenBalanceChange.count({
            where: { workspaceId }
        });
        console.log(`   Total balance changes: ${balanceChangeCount}`);

        if (balanceChangeCount === 0 && tokenTransferCount > 0) {
            console.log('❌ Token transfers exist but no balance changes!');
            console.log('   This suggests processTokenTransfer jobs are not running');
        }

        // 6. Check eVND contract configuration
        console.log('\n6. Checking eVND contract configuration...');
        const evndContract = await EvndContract.findOne({
            where: {
                workspaceId,
                contractType: 'evnd_token',
                isActive: true
            }
        });

        if (evndContract) {
            console.log(`   ✅ eVND contract configured: ${evndContract.address}`);
        } else {
            console.log('   ❌ eVND contract not configured');
            console.log('   Run: curl -X POST "http://localhost:3005/api/evnd/contracts/setup-anvil" ...');
        }

        // 7. Summary and recommendations
        console.log('\n7. Summary and Recommendations:');
        
        if (transactionCount === 0) {
            console.log('🔴 ROOT ISSUE: No transactions in database');
            console.log('   → Check if block syncing is working');
            console.log('   → Make sure you have actual transactions in Anvil');
            console.log('   → Check if workers are running');
        } else if (tokenTransferCount === 0) {
            console.log('🔴 ROOT ISSUE: Transactions exist but no token transfers');
            console.log('   → Check if transaction receipts are being processed');
            console.log('   → Check if token transfer parsing is working');
            console.log('   → Make sure transactions actually involve token transfers');
        } else if (balanceChangeCount === 0) {
            console.log('🔴 ROOT ISSUE: Token transfers exist but no balance changes');
            console.log('   → Check if processTokenTransfer workers are running');
            console.log('   → Check worker logs for errors');
        } else {
            console.log('✅ All components seem to be working');
            console.log('   → Check if top tokens page has correct filtering logic');
        }

        console.log('\n=== Debug Complete ===\n');

    } catch (error) {
        console.error('Debug failed:', error);
        throw error;
    }
}

// CLI usage
if (require.main === module) {
    const workspaceId = process.argv[2] ? parseInt(process.argv[2]) : 1;
    
    debugTokenSync(workspaceId)
        .then(() => {
            console.log('Debug completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Debug failed:', error);
            process.exit(1);
        });
}

module.exports = debugTokenSync; 