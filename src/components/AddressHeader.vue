<template>
    <v-row class="mb-1 align-stretch">
        <v-col cols="12" sm="6" lg="4">
            <v-card :loading="loadingBalance" class="h-100">
                <v-card-text class="d-flex flex-column ga-3">
                    <h3 class="font-weight-medium">Overview</h3>

                    <span v-if="contract && contract.name">
                        <h4 class="text-uppercase text-caption text-medium-emphasis">Contract Name</h4>
                        <span>{{ contract.name }}</span>
                    </span>

                    <span>
                        <h4 class="text-uppercase text-caption text-medium-emphasis">{{ currentWorkspaceStore.chain.token }} Balance</h4>
                        {{ fromWei(balance, 'ether', currentWorkspaceStore.chain.token) }}
                    </span>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="12" sm="6" lg="4">
            <v-card :loading="loadingStats" class="h-100">
                <v-card-text class="d-flex flex-column ga-4">
                    <h3 class="font-weight-medium">More Info</h3>

                    <template v-if="contract">
                        <div>
                            <h4 class="text-uppercase text-caption text-medium-emphasis">Contract Creator</h4>
                            <span v-if="contract.creationTransaction">
                                <Hash-Link :type="'address'" :hash="contract.creationTransaction.from" /> at txn <Hash-Link :type="'transaction'" :hash="contract.creationTransaction.hash" />
                            </span>
                            <span v-else>N/A (creation transaction not indexed)</span>
                        </div>

                        <div>
                            <h4 class="text-uppercase text-caption text-medium-emphasis">Token Tracker</h4>
                            <router-link class="text-decoration-none" :to="`/token/${contract.address}`">
                                {{ contract.tokenName || contract.name || contract.address }} <span v-if="contract.tokenSymbol" class="text-caption text-medium-emphasis">({{ contract.tokenSymbol }})</span>
                            </router-link>
                        </div>
                    </template>
                    <template v-else>
                        <!-- eVND Balance Display -->
                        <div v-if="evndBalance && evndBalance !== '0'">
                            <h4 class="text-uppercase text-caption text-medium-emphasis">
                                <v-icon color="amber" size="small" class="mr-1">mdi-star</v-icon>
                                eVND Balance
                            </h4>
                            <div class="d-flex align-center">
                                <span class="evnd-balance-text font-weight-medium">{{ formattedEvndBalance }}</span>
                                <v-chip 
                                    color="amber" 
                                    size="x-small" 
                                    variant="flat"
                                    class="ml-2"
                                >
                                    eVND
                                </v-chip>
                            </div>
                        </div>

                        <!-- Verification Status -->
                        <div>
                            <h4 class="text-uppercase text-caption text-medium-emphasis">Verification Status</h4>
                            <div class="d-flex align-center">
                                <VerificationBadge :address="address" size="small" />
                                <span class="ml-2">
                                    <span v-if="verificationLoading">Checking...</span>
                                    <span v-else-if="isVerified" class="text-success font-weight-medium">Verified Entity</span>
                                    <span v-else class="text-medium-emphasis">Not Verified</span>
                                </span>
                            </div>
                        </div>

                        <div>
                            <h4 class="text-uppercase text-caption text-medium-emphasis">Transactions</h4>
                            Latest:
                            <span class="font-weight-medium mr-3">
                                <router-link v-if="addressTransactionStats.last_transaction_hash" class="no-decoration" :to="`/transaction/${addressTransactionStats.last_transaction_hash}`">
                                    {{ dt.fromNow(addressTransactionStats.last_transaction_timestamp) }}
                                    <sup><v-icon size="small" icon="mdi-arrow-top-right"></v-icon></sup>
                                </router-link>
                                <span v-else>N/A</span>
                            </span>
                            First:
                            <span class="font-weight-medium">
                                <router-link v-if="addressTransactionStats.first_transaction_hash" class="no-decoration" :to="`/transaction/${addressTransactionStats.first_transaction_hash}`">
                                    {{ dt.fromNow(addressTransactionStats.first_transaction_timestamp) }}
                                    <sup><v-icon size="small" icon="mdi-arrow-top-right"></v-icon></sup>
                                </router-link>
                                <span v-else>N/A</span>
                            </span>
                        </div>
                    </template>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup>
import { inject, ref, computed, watch, onMounted } from 'vue';
import HashLink from './HashLink.vue';
import VerificationBadge from './VerificationBadge.vue';

import { useCurrentWorkspaceStore } from '../stores/currentWorkspace';
import { useSpecialToken } from '@/composables/useSpecialToken';
import { useVerification } from '@/composables/useVerification';

const currentWorkspaceStore = useCurrentWorkspaceStore();

const dt = inject('$dt');
const fromWei = inject('$fromWei');
const server = inject('$server');

// Special token composable
const { hasSpecialToken, specialTokenAddress } = useSpecialToken();

// Verification composable
const { hasVerificationContract, isAddressVerified, verifyAddress } = useVerification();

// eVND balance state
const evndBalance = ref('0');
const evndTokenData = ref(null);

// Verification state
const isVerified = ref(false);
const verificationLoading = ref(false);

const props = defineProps({
    loadingBalance: {
        type: Boolean,
        required: true
    },
    loadingStats: {
        type: Boolean,
        required: true
    },
    balance: {
        type: [String, Number],
        required: true
    },
    contract: {
        type: Object,
        default: null
    },
    addressTransactionStats: {
        type: Object,
        default: () => ({})
    },
    address: {
        type: String,
        required: true
    }
});

// Computed property for formatted eVND balance
const formattedEvndBalance = computed(() => {
    if (!evndBalance.value || evndBalance.value === '0') return '0';
    if (!evndTokenData.value) return evndBalance.value;
    
    return fromWei(
        evndBalance.value,
        evndTokenData.value.tokenDecimals || 18,
        evndTokenData.value.tokenSymbol || 'eVND'
    );
});

// Function to fetch eVND balance
const fetchEvndBalance = async () => {
    if (!hasSpecialToken.value || !props.address) return;
    
    try {
        const response = await server.getTokenBalances(props.address, ['erc20']);
        const balances = response.data;
        
        // Find the eVND token balance
        const evndTokenBalance = balances.find(balance => 
            balance.token.toLowerCase() === specialTokenAddress.value
        );
        
        if (evndTokenBalance) {
            evndBalance.value = evndTokenBalance.currentBalance;
            evndTokenData.value = evndTokenBalance.tokenContract;
        } else {
            evndBalance.value = '0';
            evndTokenData.value = null;
        }
    } catch (error) {
        console.error('Error fetching eVND balance:', error);
        evndBalance.value = '0';
        evndTokenData.value = null;
    }
};

// Function to check verification
const checkVerification = async () => {
    if (!hasVerificationContract.value || !props.address) return;
    
    verificationLoading.value = true;
    
    try {
        const result = await verifyAddress(props.address);
        isVerified.value = result;
    } catch (error) {
        console.error('Error checking verification:', error);
        isVerified.value = false;
    } finally {
        verificationLoading.value = false;
    }
};

// Watch for address changes
watch(() => props.address, () => {
    fetchEvndBalance();
    checkVerification();
}, { immediate: true });

// Fetch on mount
onMounted(() => {
    if (hasSpecialToken.value) {
        fetchEvndBalance();
    }
    if (hasVerificationContract.value) {
        checkVerification();
    }
});
</script>

<style scoped>
.evnd-balance-text {
    color: #F57C00;
    font-size: 1.1em;
}
</style> 
