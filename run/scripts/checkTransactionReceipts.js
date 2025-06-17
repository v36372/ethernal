const { Transaction, TransactionReceipt } = require('../models');
const { Op } = require('sequelize');

async function checkTransactionProcessing() {
  try {
    // Check if transactions have receipts
    const txsWithoutReceipts = await Transaction.count({
      where: {
        workspaceId: 1,
        '$receipt.id$': null
      },
      include: [{
        model: TransactionReceipt,
        as: 'receipt',
        required: false
      }]
    });
    
    const totalTxs = await Transaction.count({ where: { workspaceId: 1 } });
    
    console.log('=== Transaction Receipt Status ===');
    console.log('Total transactions:', totalTxs);
    console.log('Transactions without receipts:', txsWithoutReceipts);
    console.log('Transactions with receipts:', totalTxs - txsWithoutReceipts);
    
    // Check recent transactions
    const recentTxs = await Transaction.findAll({
      where: { workspaceId: 1 },
      order: [['blockNumber', 'DESC']],
      limit: 3,
      include: [{
        model: TransactionReceipt,
        as: 'receipt'
      }]
    });
    
    console.log('\n=== Recent Transactions ===');
    for (const tx of recentTxs) {
      console.log(`Hash: ${tx.hash}`);
      console.log(`Block: ${tx.blockNumber}`);
      console.log(`Has receipt: ${!!tx.receipt}`);
      console.log('---');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkTransactionProcessing(); 