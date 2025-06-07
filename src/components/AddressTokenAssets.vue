<template>
  <div>
    <v-data-table
      :loading="loading"
      :headers="headers"
      :items="tokens"
      :items-per-page="10"
      :row-props="getRowProps"
    >
      <template v-slot:item.token="{ item }">
        <div class="d-flex align-center">
          <v-icon 
            v-if="isSpecialTokenBalance(item)" 
            color="amber" 
            size="small" 
            class="mr-2"
            v-tooltip="'eVND'"
          >
            mdi-star
          </v-icon>
          <Hash-Link :type="'address'" :contract="item.tokenContract" :hash="item.token" :fullHash="true" :withName="true" :withTokenName="true" :notCopiable="true" />
          <span class="ml-2 text-caption text-medium-emphasis" v-if="item.tokenContract.tokenSymbol">({{ item.tokenContract.tokenSymbol }})</span>
        </div>
      </template>
      
      <template v-slot:item.contract="{ item }">
        <Hash-Link :type="'address'" :hash="item.token" :fullHash="true" />
      </template>
      
      <template v-slot:item.amount="{ item }">
        <div class="d-flex align-center">
          <span v-tooltip="item.currentBalance" :class="{ 'special-token-balance': isSpecialTokenBalance(item) }">
            {{ fromWei(item.currentBalance, item.tokenContract.tokenDecimals, item.tokenContract.tokenSymbol) }}
          </span>
          <v-chip 
            v-if="isSpecialTokenBalance(item)" 
            color="amber" 
            size="x-small" 
            variant="flat"
            class="ml-2"
          >
            eVND
          </v-chip>
        </div>
      </template>
      
      <template v-slot:no-data>
        <div class="text-center py-6">
          <p class="text-medium-emphasis">No token found</p>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import HashLink from './HashLink.vue';
import { useSpecialToken } from '@/composables/useSpecialToken';

// Props
const props = defineProps({
    address: {
        type: String,
        required: true
    }
});

// Injected services
const server = inject('$server');
const fromWei = inject('$fromWei');

// Special token composable
const { isSpecialTokenBalance, getSpecialTokenHighlightClasses } = useSpecialToken();

// Reactive state
const loading = ref(true);
const tokens = ref([]);
const headers = [
    { title: 'Token', key: 'token' },
    { title: 'Contract', key: 'contract' },
    { title: 'Amount', key: 'amount' }
];

const fetchTokens = () => {
    loading.value = true;
    server.getTokenBalances(props.address, ['erc20'])
        .then(({ data }) => tokens.value = data)
        .catch(error => console.error('Error fetching token balances:', error))
        .finally(() => loading.value = false);
};

const getRowProps = (item) => {
    if (isSpecialTokenBalance(item.item)) {
        return { class: getSpecialTokenHighlightClasses() };
    }
    return {};
};

// Lifecycle hooks
onMounted(() => {
    fetchTokens();
});
</script>

<style scoped>
:deep(.special-token-highlight) {
    background: linear-gradient(90deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%) !important;
    border-left: 4px solid #FFC107 !important;
}
:deep(.special-token-highlight):hover {
    background: linear-gradient(90deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.08) 100%) !important;
}
.special-token-balance {
    font-weight: 600;
    color: #F57C00;
}
</style> 
