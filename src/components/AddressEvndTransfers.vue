<template>
    <div v-if="hasSpecialToken">
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

            <template v-slot:item.timestamp="{ item }">
                <div class="d-flex flex-column">
                    <span>{{ $dt.shortDate(item.transaction.timestamp) }}</span>
                    <small class="text-caption text-medium-emphasis">{{ $dt.fromNow(item.transaction.timestamp) }}</small>
                </div>
            </template>

            <template v-slot:item.blockNumber="{ item }">
                <router-link
                    :to="'/block/' + item.transaction.blockNumber"
                    class="text-decoration-none"
                >
                    {{ item.transaction.blockNumber.toLocaleString() }}
                </router-link>
            </template>

            <template v-slot:item.src="{ item }">
                <div class="d-flex align-center">
                    <v-chip
                        size="x-small"
                        color="grey-lighten-1"
                        variant="flat"
                        class="mr-2"
                        v-if="item.src === props.address"
                    >
                        self
                    </v-chip>
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
                    <v-chip
                        size="x-small"
                        color="grey-lighten-1"
                        variant="flat"
                        class="mr-2"
                        v-if="item.dst === props.address"
                    >
                        self
                    </v-chip>
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
                <span class="font-weight-bold text-amber" v-if="isSpecialTokenTransfer(item)">
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
    <div v-else class="text-center py-8">
        <v-icon size="48" color="grey-lighten-1">mdi-information-outline</v-icon>
        <p class="text-h6 text-grey-lighten-1 mt-2">No eVND token configured</p>
        <p class="text-body-2 text-grey-lighten-1">Configure VITE_SPECIAL_TOKEN_ADDRESS to show eVND transfers</p>
    </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import HashLink from './HashLink.vue';
import VerificationBadge from './VerificationBadge.vue';
import { useSpecialToken } from '@/composables/useSpecialToken';

// Props
const props = defineProps({
    address: {
        type: String,
        required: true
    }
});

// Inject server instance
const $server = inject('$server');

// Special token composable
const { hasSpecialToken, isSpecialTokenTransfer, getSpecialTokenHighlightClasses } = useSpecialToken();

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
    return { class: getSpecialTokenHighlightClasses() };
};

const getEvndTransfers = () => {
    if (!hasSpecialToken.value) {
        loading.value = false;
        return;
    }

    loading.value = true;

    // Fetch a larger batch of token transfers to filter from
    $server.getAddressTokenTransfers(props.address, {
        page: 1,
        itemsPerPage: 500, // Get more transfers to filter from
        orderBy: 'blockNumber',
        order: 'desc'
        // Don't filter by tokenTypes here - get all transfers then filter client-side
    })
    .then(({ data }) => {
        console.log('Fetched transfers:', data.items.length);
        // Filter for eVND transfers only
        const evndTransfers = data.items.filter(transfer => {
            const isEvnd = isSpecialTokenTransfer(transfer);
            if (isEvnd) {
                console.log('Found eVND transfer:', transfer);
            }
            return isEvnd;
        });
        
        console.log('Filtered eVND transfers:', evndTransfers.length);
        allEvndTransfers.value = evndTransfers;
    })
    .catch(error => {
        console.error('Error fetching eVND transfers:', error);
        allEvndTransfers.value = [];
    })
    .finally(() => loading.value = false);
};

// Initialize data on mount
onMounted(() => {
    if (hasSpecialToken.value) {
        getEvndTransfers();
    } else {
        loading.value = false;
    }
});
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

:deep(.special-token-highlight) {
    background: linear-gradient(90deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%) !important;
    border-left: 4px solid #FFC107 !important;
}

:deep(.special-token-highlight):hover {
    background: linear-gradient(90deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.08) 100%) !important;
}
</style> 