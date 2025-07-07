<template>
    <div v-if="hasEvndToken && isCurrentTokenEvnd">
        <v-data-table
            class="hide-table-count"
            :loading="loading"
            :headers="headers"
            :sort-by="[{ key: 'blockNumber', order: 'desc' }]"
            items-per-page-text="Rows per page:"
            :no-data-text="'No eVND transfers found'"
            :items-per-page-options="[
                { value: 10, title: '10' },
                { value: 25, title: '25' },
                { value: 100, title: '100' }
            ]"
            item-key="id"
            :items="allEvndTransfers"
            :row-props="getRowProps">
            
            <template v-slot:item.transactionHash="{ item }">
                <Hash-Link :xsHash="true" :type="'transaction'" :hash="item.transaction.hash" />
            </template>

            <template v-slot:item.methodDetails="{ item }">
                <v-tooltip v-if="item.transaction.methodDetails && item.transaction.methodDetails.name">
                    <template v-slot:activator="{ props }">
                        <v-chip v-bind="props" color="primary-lighten-1" label size="small" variant="flat">
                            {{ item.transaction.methodDetails.name }}
                        </v-chip>
                    </template>
                    <span style="white-space: pre">{{ item.transaction.methodDetails.label }}</span>
                </v-tooltip>
                <v-chip v-else-if="item.transaction.methodDetails && item.transaction.methodDetails.sighash" color="primary-lighten-1" label size="small" variant="flat">
                    {{ item.transaction.methodDetails.sighash }}
                </v-chip>
            </template>

            <template v-slot:item.tokenType="{ item }">
                <v-chip color="success" size="x-small">ERC-20</v-chip>
            </template>

            <template v-slot:item.blockNumber="{ item }">
                <router-link
                    :to="'/block/' + item.transaction.blockNumber"
                    class="text-decoration-none"
                >
                    {{ item.transaction.blockNumber.toLocaleString() }}
                </router-link>
            </template>

            <template v-slot:item.timestamp="{ item }">
                <div class="d-flex flex-column">
                    <span>{{ $dt.shortDate(item.transaction.timestamp) }}</span>
                    <small class="text-caption text-medium-emphasis">{{ $dt.fromNow(item.transaction.timestamp) }}</small>
                </div>
            </template>

            <template v-slot:item.src="{ item }">
                <div class="d-flex align-center">
                    <Hash-Link
                        :type="'address'"
                        :xsHash="true"
                        :hash="item.src"
                        :withName="true"
                        :withTokenName="true"
                    />
                    <VerificationBadge 
                        :address="item.src" 
                        size="x-small" 
                        class="ml-1"
                    />
                </div>
            </template>

            <template v-slot:item.dst="{ item }">
                <div class="d-flex align-center">
                    <Hash-Link
                        :type="'address'"
                        :xsHash="true"
                        :hash="item.dst"
                        :withName="true"
                        :withTokenName="true"
                    />
                    <VerificationBadge 
                        :address="item.dst" 
                        size="x-small" 
                        class="ml-1"
                    />
                </div>
            </template>

            <template v-slot:item.amount="{ item }">
                <span class="font-weight-bold text-amber" v-if="isEvndTokenTransfer(item)">
                    {{ $fromWei(item.amount, item.contract.tokenDecimals || 18, item.contract.tokenSymbol || 'eVND') }}
                </span>
            </template>

            <template v-slot:item.token="{ item }">
                <div class="d-flex flex-column token-cell">
                    <div class="d-flex align-center">
                        <v-icon 
                            color="amber" 
                            size="small" 
                            class="mr-2"
                            v-tooltip="'eVND Transfer'"
                        >
                            mdi-star
                        </v-icon>
                        <Hash-Link
                            :type="'address'"
                            :xsHash="true"
                            :hash="item.token"
                            :withName="true"
                            :withTokenName="true"
                            :contract="item.contract"
                        />
                        <v-chip 
                            color="amber" 
                            size="x-small" 
                            variant="flat"
                            class="ml-2"
                        >
                            eVND
                        </v-chip>
                    </div>
                    <span class="text-caption text-medium-emphasis" v-if="item.contract?.tokenSymbol">
                        {{ item.contract.tokenSymbol }}
                    </span>
                </div>
            </template>
        </v-data-table>
    </div>
    <div v-else-if="!hasEvndToken" class="text-center py-8">
        <v-icon size="48" color="grey-lighten-1">mdi-information-outline</v-icon>
        <p class="text-h6 text-grey-lighten-1 mt-2">No eVND token configured</p>
        <p class="text-body-2 text-grey-lighten-1">Configure eVND contracts via API to show eVND transfers</p>
    </div>
    <div v-else class="text-center py-8">
        <v-icon size="48" color="grey-lighten-1">mdi-information-outline</v-icon>
        <p class="text-h6 text-grey-lighten-1 mt-2">This is not the eVND token</p>
        <p class="text-body-2 text-grey-lighten-1">eVND transfers are only available for the eVND token contract</p>
    </div>
</template>

<script setup>
import { ref, inject, onMounted, watch, computed } from 'vue';
import HashLink from './HashLink.vue';
import VerificationBadge from './VerificationBadge.vue';
import { useEvndToken } from '@/composables/useEvndToken';

// Props
const props = defineProps({
    address: {
        type: String,
        required: true
    }
});

// Inject server instance
const $server = inject('$server');

// eVND token composable
const { hasEvndToken, isEvndTokenTransfer, getEvndTokenHighlightClasses, evndTokenAddress, isEvndToken } = useEvndToken();

// Check if the current token being viewed is the eVND token
const isCurrentTokenEvnd = computed(() => {
    return isEvndToken(props.address);
});

// Reactive state
const loading = ref(true);
const allEvndTransfers = ref([]);

// Table headers
const headers = [
    { title: 'Type', key: 'tokenType', sortable: false },
    { title: 'Transaction Hash', key: 'transactionHash', sortable: false },
    { title: 'Method', key: 'methodDetails', sortable: false },
    { title: 'Block', key: 'blockNumber' },
    { title: 'Mined On', key: 'timestamp' },
    { title: 'From', key: 'src' },
    { title: 'To', key: 'dst' },
    { title: 'Amount', key: 'amount', sortable: false },
    { title: 'Token', key: 'token', sortable: false }
];

// Methods
const getRowProps = (item) => {
    return { class: getEvndTokenHighlightClasses() };
};

const getTokenEvndTransfers = () => {
    // Check if we have eVND token configured via API
    if (!hasEvndToken.value) {
        console.log('❌ No eVND token configured');
        loading.value = false;
        return;
    }

    // Check if this is the eVND token
    if (!isCurrentTokenEvnd.value) {
        console.log('❌ This is not the eVND token contract');
        loading.value = false;
        return;
    }

    console.log(`🔍 Fetching eVND transfers for token: ${props.address}`);
    console.log(`📋 eVND token address: ${evndTokenAddress.value}`);
    
    loading.value = true;

    // Use the token transfers API endpoint, but filter for eVND transfers only
    $server.getTokenEvndTransfers(props.address, {
        page: 1,
        itemsPerPage: 500,
        orderBy: 'blockNumber',
        order: 'desc'
    })
    .then(({ data }) => {
        console.log('✅ Full API response:', data);
        console.log('✅ Extracted items:', data.items?.length || 0, data.items);
        
        allEvndTransfers.value = data.items || [];
        
        // Log some details for debugging
        if (data.items && data.items.length > 0) {
            console.log('📊 Sample eVND transfer:', data.items[0]);
        } else {
            console.log('⚠️  No eVND transfers found for this token');
        }
    })
    .catch(error => {
        console.error('❌ Error fetching token eVND transfers:', error);
        allEvndTransfers.value = [];
    })
    .finally(() => loading.value = false);
};

// Initialize data on mount
onMounted(() => {
    console.log('🚀 TokenEvndTransfers component mounted for token:', props.address);
    console.log('🔍 hasEvndToken.value:', hasEvndToken.value);
    console.log('🔍 evndTokenAddress.value:', evndTokenAddress.value);
    console.log('🔍 isCurrentTokenEvnd.value:', isCurrentTokenEvnd.value);
    
    if (hasEvndToken.value && isCurrentTokenEvnd.value) {
        getTokenEvndTransfers();
    } else {
        console.log('❌ No eVND token configured or not eVND token, not fetching transfers');
        loading.value = false;
    }
});

// Watch for eVND token to become available
watch(() => hasEvndToken.value, (hasToken) => {
    console.log('👀 eVND token availability changed in TokenEvndTransfers:', hasToken);
    if (hasToken && isCurrentTokenEvnd.value && allEvndTransfers.value.length === 0 && !loading.value) {
        console.log('🔄 eVND token now available, fetching transfers...');
        getTokenEvndTransfers();
    }
}, { immediate: false });

// Watch for address changes (token address)
watch(() => props.address, () => {
    console.log('👀 Token address changed in TokenEvndTransfers:', props.address);
    if (hasEvndToken.value && isCurrentTokenEvnd.value) {
        getTokenEvndTransfers();
    } else {
        allEvndTransfers.value = [];
        loading.value = false;
    }
}, { immediate: false });
</script>

<style scoped>
.token-cell {
    max-width: 200px;
    overflow: hidden;
}

.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:deep(.evnd-token-highlight) {
    background: linear-gradient(90deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%) !important;
    border-left: 4px solid #FFC107 !important;
}

:deep(.evnd-token-highlight):hover {
    background: linear-gradient(90deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.08) 100%) !important;
}
</style> 