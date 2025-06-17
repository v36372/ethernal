const { Transaction, TransactionReceipt } = require('../models');
const { Op } = require('sequelize');

async function analyzeTokenTransactions() {
  try {
    // Get all transactions to token contracts
    const txs = await Transaction.findAll({
      where: {
        workspaceId: 1,
        to: {
          [Op.in]: ['0x09635f643e140090a9a8dcd712ed6285858cebef', '0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6']
        }
      },
      include: [{
        model: TransactionReceipt,
        as: 'receipt'
      }],
      order: [['blockNumber', 'ASC']]
    });
    
    console.log('=== All Token Contract Transactions ===');
    console.log(`Total transactions to token contracts: ${txs.length}`);
    
    for (const tx of txs) {
      console.log(`\n--- Transaction ${tx.hash} ---`);
      console.log(`To: ${tx.to}`);
      console.log(`From: ${tx.from}`);
      console.log(`Block: ${tx.blockNumber}`);
      console.log(`Value: ${tx.value}`);
      console.log(`Gas Used: ${tx.receipt ? tx.receipt.gasUsed : 'N/A'}`);
      console.log(`Status: ${tx.receipt ? tx.receipt.status : 'N/A'}`);
      console.log(`Input data length: ${tx.data ? tx.data.length : 0} chars`);
      console.log(`Input data (first 100 chars): ${tx.data ? tx.data.substring(0, 100) : 'N/A'}`);
      
      if (tx.receipt && tx.receipt.logs) {
        console.log(`Receipt logs count: ${tx.receipt.logs.length}`);
      }
      
      // Check if this looks like a token transfer (has transfer method signature)
      const transferSig = '0xa9059cbb'; // transfer(address,uint256)
      const isTransfer = tx.data && tx.data.startsWith(transferSig);
      console.log(`Looks like transfer: ${isTransfer}`);
    }
    
    // Also check if there are any transactions that actually have logs
    const txsWithLogs = await Transaction.findAll({
      where: {
        workspaceId: 1,
        '$receipt.logs$': {
          [Op.ne]: null
        }
      },
      include: [{
        model: TransactionReceipt,
        as: 'receipt',
        where: {
          logs: {
            [Op.ne]: null
          }
        }
      }],
      limit: 5
    });
    
    console.log(`\n=== Transactions with logs: ${txsWithLogs.length} ===`);
    for (const tx of txsWithLogs) {
      console.log(`Hash: ${tx.hash}, Logs: ${tx.receipt.logs.length}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

analyzeTokenTransactions(); 