const { Transaction, TransactionReceipt } = require('../models');
const { Op } = require('sequelize');

async function checkReceiptLogs() {
  try {
    // Get transactions to token contracts with their receipts
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
      order: [['blockNumber', 'DESC']],
      limit: 5
    });
    
    console.log('=== Token Contract Transactions with Receipts ===');
    for (const tx of txs) {
      console.log(`\nTx: ${tx.hash}`);
      console.log(`To: ${tx.to}`);
      console.log(`Block: ${tx.blockNumber}`);
      console.log(`Has receipt: ${!!tx.receipt}`);
      
      if (tx.receipt && tx.receipt.logs) {
        console.log(`Receipt logs count: ${tx.receipt.logs.length}`);
        if (tx.receipt.logs.length > 0) {
          console.log('First log:', JSON.stringify(tx.receipt.logs[0], null, 2));
        }
      } else {
        console.log('No logs in receipt');
      }
      console.log('---');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkReceiptLogs(); 