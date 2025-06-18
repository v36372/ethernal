const { Transaction } = require('../models');
const { Op } = require('sequelize');

async function checkReceipts() {
  try {
    const txs = await Transaction.findAll({
      where: {
        workspaceId: 1,
        to: {
          [Op.in]: ['0x09635f643e140090a9a8dcd712ed6285858cebef', '0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6']
        }
      },
      order: [['blockNumber', 'DESC']],
      limit: 5
    });
    
    console.log('=== Recent Token Contract Transactions ===');
    for (const tx of txs) {
      console.log(`\nTx: ${tx.hash}`);
      console.log(`To: ${tx.to}`);
      console.log(`Block: ${tx.blockNumber}`);
      console.log(`Receipt logs: ${tx.receipt ? JSON.stringify(tx.receipt.logs, null, 2) : 'No receipt'}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkReceipts(); 