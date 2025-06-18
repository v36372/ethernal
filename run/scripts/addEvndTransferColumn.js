const { sequelize } = require('../models');

async function addEvndTransferColumn() {
    try {
        // Check if column exists
        const [results] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'transactions' 
            AND column_name = 'isEvndTransfer'
        `);

        if (results.length === 0) {
            console.log('Adding isEvndTransfer column to transactions table...');
            
            await sequelize.query(`
                ALTER TABLE transactions 
                ADD COLUMN "isEvndTransfer" BOOLEAN NOT NULL DEFAULT false
            `);

            await sequelize.query(`
                CREATE INDEX IF NOT EXISTS transactions_is_evnd_transfer_workspace_id_idx 
                ON transactions ("isEvndTransfer", "workspaceId")
            `);

            console.log('Successfully added isEvndTransfer column and index');
        } else {
            console.log('isEvndTransfer column already exists');
        }
    } catch (error) {
        console.error('Error adding column:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

if (require.main === module) {
    addEvndTransferColumn()
        .then(() => {
            console.log('Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = addEvndTransferColumn; 