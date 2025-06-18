'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'isEvndTransfer', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates if this transaction is an eVND token transfer'
    });

    // Add index for better query performance
    await queryInterface.addIndex('transactions', ['isEvndTransfer', 'workspaceId'], {
      name: 'transactions_is_evnd_transfer_workspace_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('transactions', 'transactions_is_evnd_transfer_workspace_id_idx');
    await queryInterface.removeColumn('transactions', 'isEvndTransfer');
  }
}; 