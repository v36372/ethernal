<template>
    <v-card>
        <v-card-text>
            <v-data-table
                :loading="loading"
                :items="balances"
                :sort-by="[{ key: 'currentBalance', order: 'desc' }]"
                :headers="headers"
                :row-props="getRowProps">
            <template v-slot:top v-if="!dense">
                <div class="d-flex justify-end">
                    <v-switch hide-details="auto" v-model="unformatted" label="Unformatted Balances"></v-switch>
                </div>
            </template>
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
                    <Hash-Link :type="'address'" :hash="item.token" :withName="true" :withTokenName="true" :contract="item.tokenContract" />
                </div>
            </template>
            <template v-slot:item.currentBalance="{ item }">
                <div class="d-flex align-center">
                    <span :class="{ 'special-token-balance': isSpecialTokenBalance(item) }">
                        {{ $fromWei(item.currentBalance, item.tokenContract && item.tokenContract.tokenDecimals, item.tokenContract && item.tokenContract.tokenSymbol, unformatted) }}
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
            </v-data-table>
        </v-card-text>
    </v-card>
</template>
<script>
import HashLink from './HashLink.vue';
import { useSpecialToken } from '@/composables/useSpecialToken';

export default {
    name: 'TokenBalances',
    props: ['address', 'patterns', 'dense'],
    components: {
        HashLink
    },
    setup() {
        const { isSpecialTokenBalance, getSpecialTokenHighlightClasses } = useSpecialToken();
        
        const getRowProps = (item) => {
            if (isSpecialTokenBalance(item.item)) {
                return { class: getSpecialTokenHighlightClasses() };
            }
            return {};
        };
        
        return {
            isSpecialTokenBalance,
            getRowProps
        };
    },
    data: () => ({
        unformatted: false,
        loading: false,
        balances: [],
        headers: [
            { title: 'Token', key: 'token' },
            { title: 'Balance', key: 'currentBalance' }
        ]
    }),
    mounted() {
        this.getTokenBalances();
    },
    methods: {
        getTokenBalances() {
            this.loading = true;
            this.$server.getTokenBalances(this.address, this.patterns)
                .then(({ data }) => this.balances = data)
                .catch(console.log)
                .finally(() => this.loading = false);
        }
    },
    watch: {
        address: {
            immediate: true,
            handler() {
                this.getTokenBalances();
            }
        }
    }
}
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
