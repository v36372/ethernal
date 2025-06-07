import { ref, computed, inject } from 'vue';
import { useCurrentWorkspaceStore } from '@/stores/currentWorkspace';
import { useEnvStore } from '@/stores/env';

// ABI for the verification contract
const VERIFICATION_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_entity",
                "type": "address"
            }
        ],
        "name": "isVerifiedEntity",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

export function useVerification() {
    const currentWorkspaceStore = useCurrentWorkspaceStore();
    const envStore = useEnvStore();
    
    // Get server instance - must be called at setup time
    const $server = inject('$server');
    
    // Cache for verification results
    const verificationCache = ref(new Map());
    const pendingVerifications = ref(new Set());
    
    // Configuration - this should be configurable via environment variables
    const verificationContractAddress = computed(() => {
        // Default to the address provided by user, make this configurable
        return envStore.verificationContractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    });
    
    const hasVerificationContract = computed(() => {
        return !!verificationContractAddress.value;
    });
    
    // Check if an address is verified
    const isAddressVerified = (address) => {
        if (!address || !hasVerificationContract.value) return null;
        const cached = verificationCache.value.get(address.toLowerCase());
        return cached !== undefined ? cached : null;
    };
    
    // Verify an address by calling the smart contract
    const verifyAddress = async (address) => {
        if (!address || !hasVerificationContract.value || !currentWorkspaceStore.rpcServer) {
            return false;
        }
        
        const normalizedAddress = address.toLowerCase();
        
        // Return cached result if available
        if (verificationCache.value.has(normalizedAddress)) {
            return verificationCache.value.get(normalizedAddress);
        }
        
        // Avoid duplicate calls
        if (pendingVerifications.value.has(normalizedAddress)) {
            return false;
        }
        
        pendingVerifications.value.add(normalizedAddress);
        
        try {
            if (!$server) {
                throw new Error('Server instance not available');
            }
            
            console.log(`Checking verification for address: ${address} (normalized: ${normalizedAddress})`);
            console.log(`Verification contract: ${verificationContractAddress.value}`);
            console.log(`RPC Server: ${currentWorkspaceStore.rpcServer}`);
            
            // Call the verification contract
            const result = await $server.callContractReadMethod(
                {
                    address: verificationContractAddress.value,
                    abi: VERIFICATION_ABI
                },
                'isVerifiedEntity',
                {
                    from: null,
                    gasLimit: null,
                    gasPrice: null,
                    blockTag: 'latest'
                },
                { 0: address.toLowerCase() }, // Ensure consistent case for contract call
                currentWorkspaceStore.rpcServer
            );
            
            console.log(`Raw verification result:`, result);
            
            // Parse the result - ethers returns an array
            let isVerified = false;
            
            if (result && Array.isArray(result) && result.length > 0) {
                // Handle different possible return formats
                const value = result[0];
                if (typeof value === 'boolean') {
                    isVerified = value;
                } else if (typeof value === 'string') {
                    isVerified = value.toLowerCase() === 'true';
                } else if (typeof value === 'number') {
                    isVerified = value !== 0;
                } else {
                    // Try to convert to boolean
                    isVerified = Boolean(value);
                }
            }
            
            console.log(`Parsed verification result: ${isVerified} (from raw: ${JSON.stringify(result)})`);
            
            // Cache the result
            verificationCache.value.set(normalizedAddress, isVerified);
            
            console.log(`Verification check for ${address}: ${isVerified}`);
            
            return isVerified;
            
        } catch (error) {
            console.error(`Error verifying address ${address}:`, error);
            console.error('Error details:', {
                message: error.message,
                reason: error.reason,
                code: error.code
            });
            
            // Cache false result to avoid repeated failed calls
            verificationCache.value.set(normalizedAddress, false);
            
            return false;
        } finally {
            pendingVerifications.value.delete(normalizedAddress);
        }
    };
    
    // Batch verify multiple addresses
    const verifyAddresses = async (addresses) => {
        if (!addresses || !addresses.length) return {};
        
        const results = {};
        const promises = addresses.map(async (address) => {
            if (address) {
                const isVerified = await verifyAddress(address);
                results[address.toLowerCase()] = isVerified;
            }
        });
        
        await Promise.all(promises);
        return results;
    };
    
    // Clear verification cache
    const clearVerificationCache = () => {
        verificationCache.value.clear();
        pendingVerifications.value.clear();
    };
    
    // Get verification badge component props
    const getVerificationBadgeProps = (address, size = 'small') => {
        const isVerified = isAddressVerified(address);
        
        if (!isVerified) return null;
        
        return {
            icon: 'mdi-check-decagram',
            color: 'success',
            size: size,
            tooltip: 'Verified Entity'
        };
    };
    
    return {
        hasVerificationContract,
        verificationContractAddress,
        isAddressVerified,
        verifyAddress,
        verifyAddresses,
        clearVerificationCache,
        getVerificationBadgeProps
    };
} 