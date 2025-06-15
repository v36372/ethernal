import { computed } from 'vue';
import { useEvndContracts } from './useEvndContracts';

export function useEvndToken() {
    const { evndTokenAddress, hasEvndToken, isEvndTransfer } = useEvndContracts();
    
    // Check if an address is the eVND token
    const isEvndToken = (address) => {
        if (!hasEvndToken.value || !address) return false;
        return address.toLowerCase() === evndTokenAddress.value;
    };
    
    // Check if a transaction contains eVND token transfers
    const hasEvndTokenTransfer = (transaction) => {
        if (!hasEvndToken.value || !transaction) return false;
        
        // Check token transfers in the transaction
        if (transaction.tokenTransfers && transaction.tokenTransfers.length > 0) {
            return transaction.tokenTransfers.some(transfer => 
                isEvndToken(transfer.token)
            );
        }
        
        // Check if the transaction is to the eVND token contract
        if (transaction.to && isEvndToken(transaction.to)) {
            return true;
        }
        
        // Check if the transaction created the eVND token contract
        if (transaction.receipt?.contractAddress && isEvndToken(transaction.receipt.contractAddress)) {
            return true;
        }
        
        return false;
    };
    
    // Check if a token balance is for the eVND token
    const isEvndTokenBalance = (tokenBalance) => {
        if (!hasEvndToken.value || !tokenBalance) return false;
        return isEvndToken(tokenBalance.token);
    };
    
    // Check if a token transfer involves the eVND token (alias for consistency)
    const isEvndTokenTransfer = (transfer) => {
        return isEvndTransfer(transfer);
    };
    
    // Get highlight classes for eVND token items
    const getEvndTokenHighlightClasses = () => {
        return 'evnd-token-highlight';
    };
    
    return {
        evndTokenAddress,
        hasEvndToken,
        isEvndToken,
        hasEvndTokenTransfer,
        isEvndTokenBalance,
        isEvndTokenTransfer,
        getEvndTokenHighlightClasses
    };
} 