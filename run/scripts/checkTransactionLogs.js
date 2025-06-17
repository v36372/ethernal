const { Transaction, TransactionReceipt, TransactionLog } = require('../models');
const { Op } = require('sequelize');

async function checkTransactionLogs() {
  try {
    // Check total logs
    const totalLogs = await TransactionLog.count({ where: { workspaceId: 1 } });
    console.log(`Total transaction logs: ${totalLogs}`);
    
    // Get transactions to token contracts with their logs
    const txs = await Transaction.findAll({
      where: {
        workspaceId: 1,
        to: {
          [Op.in]: ['0x09635f643e140090a9a8dcd712ed6285858cebef', '0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6']
        }
      },
      include: [{
        model: TransactionReceipt,
        as: 'receipt',
        include: [{
          model: TransactionLog,
          as: 'logs'
        }]
      }],
      order: [['blockNumber', 'ASC']]
    });
    
    console.log('\n=== Token Contract Transactions with Logs ===');
    for (const tx of txs) {
      console.log(`\n--- Transaction ${tx.hash} ---`);
      console.log(`To: ${tx.to}`);
      console.log(`Block: ${tx.blockNumber}`);
      console.log(`Input: ${tx.data.substring(0, 10)}... (${tx.data.length} chars)`);
      
      if (tx.receipt) {
        console.log(`Receipt status: ${tx.receipt.status}`);
        console.log(`Gas used: ${tx.receipt.gasUsed}`);
        console.log(`Logs count: ${tx.receipt.logs ? tx.receipt.logs.length : 0}`);
        
        if (tx.receipt.logs && tx.receipt.logs.length > 0) {
          for (let i = 0; i < tx.receipt.logs.length; i++) {
            const log = tx.receipt.logs[i];
            console.log(`  Log ${i}: address=${log.address}, topics=${log.topics ? log.topics.length : 0}`);
            if (log.topics && log.topics.length > 0) {
              console.log(`    Topic 0: ${log.topics[0]} (${log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' ? 'Transfer' : 'Other'})`);
            }
          }
        }
      } else {
        console.log('No receipt');
      }
    }
    
    // Check if there are any Transfer events in the system
    const transferLogs = await TransactionLog.findAll({
      where: {
        workspaceId: 1,
        topics: {
          [Op.contains]: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']
        }
      },
      limit: 5
    });
    
    console.log(`\n=== Transfer events found: ${transferLogs.length} ===`);
    for (const log of transferLogs) {
      console.log(`Address: ${log.address}, Block: ${log.blockNumber}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkTransactionLogs(); 