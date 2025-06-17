const { TransactionLog, TokenTransfer } = require('../models');
const { getTokenTransfer } = require('../lib/abi');
const { Op } = require('sequelize');

async function testTokenTransferExtraction() {
  try {
    // Get the Transfer logs we found earlier
    const transferLogs = await TransactionLog.findAll({
      where: {
        workspaceId: 1,
        topics: {
          [Op.contains]: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']
        }
      },
      limit: 5
    });
    
    console.log(`=== Found ${transferLogs.length} Transfer logs ===`);
    
    for (const log of transferLogs) {
      console.log(`\n--- Log ID: ${log.id} ---`);
      console.log(`Address: ${log.address}`);
      console.log(`Block: ${log.blockNumber}`);
      console.log(`Topics: ${log.topics.length}`);
      console.log(`Data: ${log.data}`);
      
      // Test token transfer extraction
      const tokenTransfer = getTokenTransfer(log);
      console.log(`Extracted token transfer:`, tokenTransfer);
      
      // Check if token transfer already exists
      const existingTransfer = await TokenTransfer.findOne({
        where: { transactionLogId: log.id }
      });
      console.log(`Existing token transfer: ${existingTransfer ? 'YES' : 'NO'}`);
    }
    
    // Check total token transfers
    const totalTransfers = await TokenTransfer.count({ where: { workspaceId: 1 } });
    console.log(`\n=== Total token transfers in DB: ${totalTransfers} ===`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

testTokenTransferExtraction(); 