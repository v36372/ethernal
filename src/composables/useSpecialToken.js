import { computed } from 'vue';
import { useEnvStore } from '@/stores/env';

export function useSpecialToken() {
    const envStore = useEnvStore();
    
    const specialTokenAddress = computed(() => envStore.specialTokenAddress);
    const hasSpecialToken = computed(() => envStore.hasSpecialToken);
    
    // Check if an address is the special token
    const isSpecialToken = (address) => {
        if (!hasSpecialToken.value || !address) return false;
        return address.toLowerCase() === specialTokenAddress.value;
    };
    
    // Check if a transaction contains special token transfers
    const hasSpecialTokenTransfer = (transaction) => {
        if (!hasSpecialToken.value || !transaction) return false;
        
        // Check token transfers in the transaction
        if (transaction.tokenTransfers && transaction.tokenTransfers.length > 0) {
            return transaction.tokenTransfers.some(transfer => 
                isSpecialToken(transfer.token)
            );
        }
        
        // Check if the transaction is to the special token contract
        if (transaction.to && isSpecialToken(transaction.to)) {
            return true;
        }
        
        // Check if the transaction created the special token contract
        if (transaction.receipt?.contractAddress && isSpecialToken(transaction.receipt.contractAddress)) {
            return true;
        }
        
        return false;
    };
    
    // Check if a token balance is for the special token
    const isSpecialTokenBalance = (tokenBalance) => {
        if (!hasSpecialToken.value || !tokenBalance) return false;
        return isSpecialToken(tokenBalance.token);
    };
    
    // Check if a token transfer involves the special token
    const isSpecialTokenTransfer = (transfer) => {
        if (!hasSpecialToken.value || !transfer) return false;
        return isSpecialToken(transfer.token);
    };
    
    // Get highlight classes for special token items
    const getSpecialTokenHighlightClasses = () => {
        return 'special-token-highlight';
    };
    
    return {
        specialTokenAddress,
        hasSpecialToken,
        isSpecialToken,
        hasSpecialTokenTransfer,
        isSpecialTokenBalance,
        isSpecialTokenTransfer,
        getSpecialTokenHighlightClasses
    };
} 