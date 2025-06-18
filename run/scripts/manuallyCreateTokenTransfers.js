const { TransactionLog, TokenTransfer, Transaction } = require('../models');
const { getTokenTransfer } = require('../lib/abi');
const { Op } = require('sequelize');

async function manuallyCreateTokenTransfers() {
  try {
    // Get the Transfer logs that don't have token transfers
    const transferLogs = await TransactionLog.findAll({
      where: {
        workspaceId: 1,
        topics: {
          [Op.contains]: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']
        }
      },
      include: [{
        model: TokenTransfer,
        as: 'tokenTransfer',
        required: false
      }]
    });
    
    console.log(`=== Processing ${transferLogs.length} Transfer logs ===`);
    
    const tokensToCreate = [];
    
    for (const log of transferLogs) {
      if (log.tokenTransfer) {
        console.log(`Log ${log.id} already has token transfer`);
        continue;
      }
      
      console.log(`\n--- Processing Log ID: ${log.id} ---`);
      
      // Extract token transfer
      const tokenTransfer = getTokenTransfer(log);
      if (!tokenTransfer) {
        console.log('Could not extract token transfer');
        continue;
      }
      
      console.log('Extracted:', tokenTransfer);
      
      // Get the transaction ID
      const receipt = await log.getReceipt();
      if (!receipt) {
        console.log('No receipt found');
        continue;
      }
      
      const tokenTransferData = {
        transactionId: receipt.transactionId,
        transactionLogId: log.id,
        workspaceId: log.workspaceId,
        token: tokenTransfer.token,
        src: tokenTransfer.src,
        dst: tokenTransfer.dst,
        amount: tokenTransfer.amount,
        tokenId: tokenTransfer.tokenId
      };
      
      tokensToCreate.push(tokenTransferData);
      console.log('Will create:', tokenTransferData);
    }
    
    if (tokensToCreate.length > 0) {
      console.log(`\n=== Creating ${tokensToCreate.length} token transfers ===`);
      
      // Create without hooks to avoid transaction issues
      const createdTransfers = await TokenTransfer.bulkCreate(tokensToCreate, {
        ignoreDuplicates: true,
        returning: true,
        hooks: false  // Disable hooks to avoid afterCreate issues
      });
      
      console.log(`Created ${createdTransfers.length} token transfers`);
      
      // Check final count
      const finalCount = await TokenTransfer.count({ where: { workspaceId: 1 } });
      console.log(`Total token transfers now: ${finalCount}`);
    } else {
      console.log('No token transfers to create');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
  process.exit(0);
}

manuallyCreateTokenTransfers(); 