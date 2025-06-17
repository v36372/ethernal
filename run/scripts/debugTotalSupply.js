const { ProviderConnector, ContractConnector } = require('../lib/rpc');

async function debugTotalSupply() {
    try {
        console.log('\n=== Debug Total Supply Fetching ===\n');

        // Your Anvil RPC
        const rpcServer = 'http://127.0.0.1:8545';
        
        // Your eVND token address (from Anvil setup)
        const tokenAddress = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6';
        
        console.log(`RPC Server: ${rpcServer}`);
        console.log(`Token Address: ${tokenAddress}`);

        // Test RPC connection
        console.log('\n1. Testing RPC connection...');
        const provider = new ProviderConnector(rpcServer);
        
        try {
            const block = await provider.fetchLatestBlock();
            console.log(`✅ RPC connected, latest block: ${block.number}`);
        } catch (error) {
            console.log(`❌ RPC connection failed: ${error.message}`);
            return;
        }

        // Test contract exists and methods
        console.log('\n2. Testing contract methods...');
        const contractConnector = new ContractConnector(rpcServer, tokenAddress, []);
        
        try {
            const bytecode = await contractConnector.getBytecode();
            if (bytecode === '0x' || !bytecode) {
                console.log(`❌ No contract found at ${tokenAddress}`);
                return;
            }
            console.log(`✅ Contract exists, bytecode length: ${bytecode.length}`);
        } catch (error) {
            console.log(`❌ Failed to check contract: ${error.message}`);
            return;
        }

        // Test totalSupply() call
        console.log('\n3. Testing totalSupply() call...');
        try {
            const result = await contractConnector.totalSupply();
            
            if (result && result.toString() !== '0') {
                const totalSupply = parseInt(result.toString());
                console.log(`✅ Total Supply: ${totalSupply}`);
                console.log(`   Formatted: ${totalSupply.toLocaleString()}`);
                
                // Test with decimals
                try {
                    const decimals = await contractConnector.decimals();
                    const formattedSupply = totalSupply / Math.pow(10, decimals);
                    console.log(`   With decimals (${decimals}): ${formattedSupply.toLocaleString()}`);
                } catch (decError) {
                    console.log(`   Could not get decimals: ${decError.message}`);
                }
            } else {
                console.log(`❌ totalSupply() returned: ${result}`);
            }
        } catch (error) {
            console.log(`❌ totalSupply() call failed: ${error.message}`);
        }

        // Test other common ERC20 methods
        console.log('\n4. Testing other ERC20 methods...');
        
        // name()
        try {
            const nameResult = await contractConnector.name();
            console.log(`✅ name(): ${nameResult}`);
        } catch (error) {
            console.log(`❌ name() call failed: ${error.message}`);
        }

        // symbol()
        try {
            const symbolResult = await contractConnector.symbol();
            console.log(`✅ symbol(): ${symbolResult}`);
        } catch (error) {
            console.log(`❌ symbol() call failed: ${error.message}`);
        }

        // Check if it's ERC20
        try {
            const isErc20 = await contractConnector.isErc20();
            console.log(`✅ isErc20(): ${isErc20}`);
        } catch (error) {
            console.log(`❌ isErc20() call failed: ${error.message}`);
        }

        console.log('\n=== Debug Complete ===\n');

    } catch (error) {
        console.error('Debug failed:', error);
    }
}

// Run the debug
debugTotalSupply()
    .then(() => {
        console.log('Debug completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Debug failed:', error);
        process.exit(1);
    }); 