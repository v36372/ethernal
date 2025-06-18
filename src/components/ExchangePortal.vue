<template>
    <v-container fluid class="exchange-portal">
        <v-row>
            <v-col cols="12">
                <!-- Header -->
                <div class="exchange-portal-header mb-6">
                    <v-icon class="mr-3" size="32">🔄</v-icon>
                    <h1 class="text-h4 font-weight-bold">Exchange Portal</h1>
                    <v-chip class="ml-4" size="small" color="success" variant="tonal">
                        <v-icon size="16" class="mr-1">mdi-check-circle</v-icon>
                        LIVE
                    </v-chip>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="text-center mt-8">
                    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                    <p class="mt-4 text-h6">Loading exchange portal data...</p>
                </div>

                <!-- Error State -->
                <v-alert v-else-if="error" type="error" class="mt-4">
                    {{ error }}
                </v-alert>

                <!-- Exchange Portal Content -->
                <template v-else>
                    <!-- Current Exchange Rates Section -->
                    <v-card class="portal-card mb-6" elevation="1">
                        <v-card-text class="pa-6">
                            <div class="section-header mb-6">
                                <v-icon class="mr-3" size="28">💱</v-icon>
                                <h2 class="text-h5 font-weight-bold">Current Exchange Rates</h2>
                                <v-chip class="ml-4" size="small" variant="tonal">
                                    <v-icon size="16" class="mr-1">mdi-shield-check</v-icon>
                                    Government Controlled
                                </v-chip>
                            </div>

                            <v-row>
                                <!-- Main Exchange Rate -->
                                <v-col cols="12" md="6">
                                    <v-card class="rate-card" elevation="1">
                                        <v-card-text class="pa-4">
                                            <div class="d-flex align-center justify-space-between">
                                                <div class="rate-display d-flex align-center">
                                                    <v-icon size="32" class="mr-3">mdi-currency-usd</v-icon>
                                                    <div class="rate-info">
                                                        <div class="rate-label text-caption text-medium-emphasis">USD to e-VND</div>
                                                        <div class="rate-value text-h3 font-weight-bold">
                                                            24,350 ₫
                                                        </div>
                                                        <div class="rate-change d-flex align-center mt-1">
                                                            <v-icon size="16" color="success">mdi-trending-up</v-icon>
                                                            <span class="text-success text-caption font-weight-bold">+0.12% today</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="rate-actions">
                                                    <v-btn 
                                                        variant="outlined" 
                                                        size="small"
                                                        prepend-icon="mdi-refresh"
                                                        @click="refreshRates"
                                                        :loading="refreshingRates"
                                                    >
                                                        Refresh
                                                    </v-btn>
                                                </div>
                                            </div>
                                            <div class="rate-updated text-caption text-medium-emphasis mt-2">
                                                Last updated: 2 minutes ago
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>

                                <!-- Rate History Summary -->
                                <v-col cols="12" md="6">
                                    <v-card class="rate-history-card" elevation="1">
                                        <v-card-text class="pa-4">
                                            <h4 class="text-h6 font-weight-bold mb-3">Exchange Rate History</h4>
                                            <div class="rate-history-items">
                                                <div class="history-item mb-2">
                                                    <div class="d-flex justify-space-between align-center">
                                                        <span class="text-body-2">24 Hours High</span>
                                                        <span class="font-weight-bold">24,387 ₫</span>
                                                    </div>
                                                </div>
                                                <div class="history-item mb-2">
                                                    <div class="d-flex justify-space-between align-center">
                                                        <span class="text-body-2">24 Hours Low</span>
                                                        <span class="font-weight-bold">24,298 ₫</span>
                                                    </div>
                                                </div>
                                                <div class="history-item mb-2">
                                                    <div class="d-flex justify-space-between align-center">
                                                        <span class="text-body-2">Weekly Average</span>
                                                        <span class="font-weight-bold">24,312 ₫</span>
                                                    </div>
                                                </div>
                                                <div class="history-item">
                                                    <div class="d-flex justify-space-between align-center">
                                                        <span class="text-body-2">Monthly Average</span>
                                                        <span class="font-weight-bold">24,205 ₫</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <!-- Money Flow Analytics -->
                    <v-card class="portal-card mb-6" elevation="1">
                        <v-card-text class="pa-6">
                            <div class="section-header mb-6">
                                <v-icon class="mr-3" size="28">📊</v-icon>
                                <h2 class="text-h5 font-weight-bold">Money Flow Analytics</h2>
                                <v-chip class="ml-4" size="small" variant="tonal">
                                    <v-icon size="16" class="mr-1">mdi-clock</v-icon>
                                    Real-time
                                </v-chip>
                            </div>

                            <!-- Summary Cards -->
                            <v-row class="mb-6">
                                <!-- Today -->
                                <v-col cols="12" md="4">
                                    <v-card class="analytics-card" elevation="1">
                                        <v-card-text class="pa-4">
                                            <div class="analytics-period mb-3">
                                                <v-icon class="mr-2">mdi-calendar-today</v-icon>
                                                <span class="text-h6 font-weight-bold">Today</span>
                                            </div>
                                            <div class="analytics-values">
                                                <div class="value-item mb-3">
                                                    <span class="text-body-2 text-medium-emphasis">Total Inflow</span>
                                                    <div class="text-h5 font-weight-bold text-success">
                                                        +2.8B e-VND
                                                    </div>
                                                    <div class="text-caption text-success">
                                                        <v-icon size="12" class="mr-1">mdi-trending-up</v-icon>
                                                        +12.5% vs yesterday
                                                    </div>
                                                </div>
                                                <div class="value-item mb-3">
                                                    <span class="text-body-2 text-medium-emphasis">Total Outflow</span>
                                                    <div class="text-h5 font-weight-bold text-error">
                                                        -2.3B e-VND
                                                    </div>
                                                </div>
                                                <div class="value-item">
                                                    <span class="text-body-2 text-medium-emphasis">Transactions</span>
                                                    <div class="text-h5 font-weight-bold">
                                                        15,247
                                                    </div>
                                                </div>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>

                                <!-- This Month -->
                                <v-col cols="12" md="4">
                                    <v-card class="analytics-card" elevation="1">
                                        <v-card-text class="pa-4">
                                            <div class="analytics-period mb-3">
                                                <v-icon class="mr-2">mdi-calendar-month</v-icon>
                                                <span class="text-h6 font-weight-bold">This Month</span>
                                            </div>
                                            <div class="analytics-values">
                                                <div class="value-item mb-3">
                                                    <span class="text-body-2 text-medium-emphasis">Net Flow</span>
                                                    <div class="text-h5 font-weight-bold text-success">
                                                        +45.2B e-VND
                                                    </div>
                                                    <div class="text-caption text-success">
                                                        <v-icon size="12" class="mr-1">mdi-trending-up</v-icon>
                                                        +8.3% vs last month
                                                    </div>
                                                </div>
                                                <div class="value-item mb-3">
                                                    <span class="text-body-2 text-medium-emphasis">Avg Daily Volume</span>
                                                    <div class="text-h5 font-weight-bold">
                                                        1.8B e-VND
                                                    </div>
                                                </div>
                                                <div class="value-item">
                                                    <span class="text-body-2 text-medium-emphasis">Total Transactions</span>
                                                    <div class="text-h5 font-weight-bold">
                                                        387,456
                                                    </div>
                                                </div>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>

                                <!-- This Year -->
                                <v-col cols="12" md="4">
                                    <v-card class="analytics-card" elevation="1">
                                        <v-card-text class="pa-4">
                                            <div class="analytics-period mb-3">
                                                <v-icon class="mr-2">mdi-calendar</v-icon>
                                                <span class="text-h6 font-weight-bold">This Year</span>
                                            </div>
                                            <div class="analytics-values">
                                                <div class="value-item mb-3">
                                                    <span class="text-body-2 text-medium-emphasis">Net Flow</span>
                                                    <div class="text-h5 font-weight-bold text-success">
                                                        +892.7B e-VND
                                                    </div>
                                                    <div class="text-caption text-success">
                                                        <v-icon size="12" class="mr-1">mdi-trending-up</v-icon>
                                                        +15.7% vs last year
                                                    </div>
                                                </div>
                                                <div class="value-item mb-3">
                                                    <span class="text-body-2 text-medium-emphasis">Peak Monthly Volume</span>
                                                    <div class="text-h5 font-weight-bold">
                                                        78.3B e-VND
                                                    </div>
                                                </div>
                                                <div class="value-item">
                                                    <span class="text-body-2 text-medium-emphasis">Total Transactions</span>
                                                    <div class="text-h5 font-weight-bold">
                                                        9.2M
                                                    </div>
                                                </div>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row>

                            <!-- Detailed Flow Breakdown -->
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-card class="flow-breakdown-card" elevation="1">
                                        <v-card-text class="pa-4">
                                            <h4 class="text-h6 font-weight-bold mb-4">
                                                <v-icon class="mr-2" color="success">mdi-arrow-down-circle</v-icon>
                                                Inflow Sources (Today)
                                            </h4>
                                            <div class="flow-items">
                                                <div class="flow-item mb-3">
                                                    <div class="d-flex justify-space-between align-center">
                                                        <div class="d-flex align-center">
                                                            <v-icon size="20" class="mr-2">mdi-bank</v-icon>
                                                            <span>Commercial Banks</span>
                                                        </div>
                                                        <div class="text-right">
                                                            <div class="font-weight-bold">1.8B e-VND</div>
                                                            <div class="text-caption text-medium-emphasis">64.3%</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="flow-item mb-3">
                                                    <div class="d-flex justify-space-between align-center">
                                                        <div class="d-flex align-center">
                                                            <v-icon size="20" class="mr-2">mdi-office-building</v-icon>
                                                            <span>Government Entities</span>
                                                        </div>
                                                        <div class="text-right">
                                                            <div class="font-weight-bold">650M e-VND</div>
                                                            <div class="text-caption text-medium-emphasis">23.2%</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="flow-item mb-3">
                                                    <div class="d-flex justify-space-between align-center">
                                                        <div class="d-flex align-center">
                                                            <v-icon size="20" class="mr-2">mdi-domain</v-icon>
                                                            <span>Corporate Treasury</span>
                                                        </div>
                                                        <div class="text-right">
                                                            <div class="font-weight-bold">350M e-VND</div>
                                                            <div class="text-caption text-medium-emphasis">12.5%</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-card class="flow-breakdown-card" elevation="1">
                                        <v-card-text class="pa-4">
                                            <h4 class="text-h6 font-weight-bold mb-4">
                                                <v-icon class="mr-2" color="error">mdi-arrow-up-circle</v-icon>
                                                Outflow Destinations (Today)
                                            </h4>
                                            <div class="flow-items">
                                                <div class="flow-item mb-3">
                                                    <div class="d-flex justify-space-between align-center">
                                                        <div class="d-flex align-center">
                                                            <v-icon size="20" class="mr-2">mdi-shopping</v-icon>
                                                            <span>Retail Payments</span>
                                                        </div>
                                                        <div class="text-right">
                                                            <div class="font-weight-bold">1.2B e-VND</div>
                                                            <div class="text-caption text-medium-emphasis">52.2%</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="flow-item mb-3">
                                                    <div class="d-flex justify-space-between align-center">
                                                        <div class="d-flex align-center">
                                                            <v-icon size="20" class="mr-2">mdi-bank-transfer</v-icon>
                                                            <span>Bank Settlements</span>
                                                        </div>
                                                        <div class="text-right">
                                                            <div class="font-weight-bold">750M e-VND</div>
                                                            <div class="text-caption text-medium-emphasis">32.6%</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="flow-item mb-3">
                                                    <div class="d-flex justify-space-between align-center">
                                                        <div class="d-flex align-center">
                                                            <v-icon size="20" class="mr-2">mdi-currency-usd-off</v-icon>
                                                            <span>Currency Redemption</span>
                                                        </div>
                                                        <div class="text-right">
                                                            <div class="font-weight-bold">350M e-VND</div>
                                                            <div class="text-caption text-medium-emphasis">15.2%</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <!-- Exchange Portal Metrics -->
                    <v-card class="portal-card mb-6" elevation="1">
                        <v-card-text class="pa-6">
                            <div class="section-header mb-6">
                                <v-icon class="mr-3" size="28">📈</v-icon>
                                <h2 class="text-h5 font-weight-bold">Exchange Portal Metrics</h2>
                            </div>

                            <v-row>
                                <v-col cols="12" sm="6" md="3">
                                    <v-card class="metric-card" elevation="1">
                                        <v-card-text class="text-center pa-4">
                                            <v-icon size="40">mdi-speedometer</v-icon>
                                            <div class="metric-value text-h4 font-weight-bold mt-2">99.97%</div>
                                            <div class="metric-label text-body-2 text-medium-emphasis">System Uptime</div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                                <v-col cols="12" sm="6" md="3">
                                    <v-card class="metric-card" elevation="1">
                                        <v-card-text class="text-center pa-4">
                                            <v-icon size="40">mdi-timer</v-icon>
                                            <div class="metric-value text-h4 font-weight-bold mt-2">1.2s</div>
                                            <div class="metric-label text-body-2 text-medium-emphasis">Avg Response Time</div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                                <v-col cols="12" sm="6" md="3">
                                    <v-card class="metric-card" elevation="1">
                                        <v-card-text class="text-center pa-4">
                                            <v-icon size="40">mdi-account-multiple</v-icon>
                                            <div class="metric-value text-h4 font-weight-bold mt-2">8,247</div>
                                            <div class="metric-label text-body-2 text-medium-emphasis">Active Users (24h)</div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                                <v-col cols="12" sm="6" md="3">
                                    <v-card class="metric-card" elevation="1">
                                        <v-card-text class="text-center pa-4">
                                            <v-icon size="40">mdi-security</v-icon>
                                            <div class="metric-value text-h4 font-weight-bold mt-2">100%</div>
                                            <div class="metric-label text-body-2 text-medium-emphasis">Security Score</div>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <!-- Recent Exchange Transactions -->
                    <v-card class="portal-card" elevation="1">
                        <v-card-text class="pa-6">
                            <div class="section-header mb-6">
                                <v-icon class="mr-3" size="28">📋</v-icon>
                                <h2 class="text-h5 font-weight-bold">Recent Exchange Transactions</h2>
                                <v-spacer></v-spacer>
                                <v-btn variant="outlined" size="small" @click="refreshData">
                                    <v-icon class="mr-1">mdi-refresh</v-icon>
                                    Refresh
                                </v-btn>
                            </div>

                            <v-table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Rate</th>
                                        <th>Institution</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="transaction in recentTransactions" :key="transaction.id">
                                        <td class="text-caption">{{ transaction.time }}</td>
                                        <td>
                                            <v-chip 
                                                size="x-small" 
                                                :color="transaction.type === 'Inflow' ? 'success' : 'error'"
                                                variant="tonal"
                                            >
                                                {{ transaction.type }}
                                            </v-chip>
                                        </td>
                                        <td class="font-weight-bold">{{ transaction.amount }}</td>
                                        <td class="text-body-2">{{ transaction.rate }}</td>
                                        <td class="text-body-2">{{ transaction.institution }}</td>
                                        <td>
                                            <v-chip 
                                                size="x-small" 
                                                color="success" 
                                                variant="tonal"
                                            >
                                                <v-icon size="12" class="mr-1">mdi-check</v-icon>
                                                Completed
                                            </v-chip>
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-card-text>
                    </v-card>
                </template>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';

const $server = inject('$server');

// Reactive data
const exchangePortalData = ref(null);
const loading = ref(true);
const error = ref(null);
const refreshingRates = ref(false);

// Mock data for recent transactions
const recentTransactions = ref([
    {
        id: 1,
        time: '14:35:22',
        type: 'Inflow',
        amount: '125M e-VND',
        rate: '24,350 ₫',
        institution: 'Vietcombank'
    },
    {
        id: 2,
        time: '14:32:18',
        type: 'Outflow',
        amount: '89M e-VND',
        rate: '24,348 ₫',
        institution: 'BIDV'
    },
    {
        id: 3,
        time: '14:28:45',
        type: 'Inflow',
        amount: '67M e-VND',
        rate: '24,352 ₫',
        institution: 'Techcombank'
    },
    {
        id: 4,
        time: '14:25:12',
        type: 'Outflow',
        amount: '203M e-VND',
        rate: '24,355 ₫',
        institution: 'Ministry of Finance'
    },
    {
        id: 5,
        time: '14:22:08',
        type: 'Inflow',
        amount: '156M e-VND',
        rate: '24,349 ₫',
        institution: 'VPBank'
    }
]);

// Methods
const fetchExchangePortalData = async () => {
    try {
        loading.value = true;
        error.value = null;
        
        const response = await $server.getEvndDashboard();
        if (response.data?.exchangePortalStatus) {
            exchangePortalData.value = response.data.exchangePortalStatus;
        } else {
            exchangePortalData.value = null;
        }
    } catch (err) {
        console.error('Error fetching exchange portal data:', err);
        error.value = 'Failed to load exchange portal data. Please try again later.';
    } finally {
        loading.value = false;
    }
};

const refreshRates = async () => {
    try {
        refreshingRates.value = true;
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // In a real implementation, this would call a specific API to refresh rates
        await fetchExchangePortalData();
    } catch (err) {
        console.error('Error refreshing rates:', err);
    } finally {
        refreshingRates.value = false;
    }
};

const refreshData = () => {
    fetchExchangePortalData();
};

// Lifecycle
onMounted(() => {
    fetchExchangePortalData();
});
</script>

<style scoped>
.exchange-portal {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
    padding: 2rem 0;
}

.v-theme--dark .exchange-portal {
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
}

.exchange-portal-header {
    display: flex;
    align-items: center;
    color: var(--text-primary);
    margin-bottom: 2rem;
}

.portal-card {
    background: var(--card-background) !important;
    color: var(--text-primary);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

.section-header {
    display: flex;
    align-items: center;
    color: var(--text-primary);
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.rate-card,
.rate-history-card,
.analytics-card,
.flow-breakdown-card,
.metric-card {
    background: var(--card-background) !important;
    color: var(--text-primary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.1s ease;
}

/* Light theme specific styling */
.v-theme--light .rate-card,
.v-theme--light .rate-history-card,
.v-theme--light .analytics-card,
.v-theme--light .flow-breakdown-card,
.v-theme--light .metric-card {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.12);
}

/* Dark theme specific styling */
.v-theme--dark .rate-card,
.v-theme--dark .rate-history-card,
.v-theme--dark .analytics-card,
.v-theme--dark .flow-breakdown-card,
.v-theme--dark .metric-card {
    background: #2a2a2a !important;
    border-color: #444;
}

.rate-display {
    flex: 1;
}

.rate-value {
    color: var(--text-primary);
}

.rate-history-items,
.analytics-values,
.flow-items {
    font-family: 'Courier New', monospace;
}

.history-item,
.value-item,
.flow-item {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
}

.history-item:last-child,
.value-item:last-child,
.flow-item:last-child {
    border-bottom: none;
}

.analytics-period {
    display: flex;
    align-items: center;
    color: var(--text-primary);
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
}

.flow-item {
    background: var(--hover-background);
    border-radius: 4px;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Light theme specific flow item styling */
.v-theme--light .flow-item {
    background: rgba(0, 0, 0, 0.02);
    border-color: rgba(0, 0, 0, 0.08);
}

/* Dark theme specific flow item styling */
.v-theme--dark .flow-item {
    background: rgba(255, 255, 255, 0.05);
    border-color: #444;
}

.metric-card {
    transition: all 0.2s ease;
}

.metric-card:hover {
    transform: translateY(-2px);
    border-color: var(--v-theme-primary);
}

/* Light theme hover effects */
.v-theme--light .metric-card:hover {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Dark theme hover effects */
.v-theme--dark .metric-card:hover {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.metric-value {
    color: var(--text-primary);
    line-height: 1;
}

.rate-actions {
    display: flex;
    gap: 1rem;
}

/* Table styling to match the project theme */
.v-table {
    background: transparent !important;
    color: var(--text-primary);
    font-family: 'Courier New', monospace;
}

.v-table th {
    background: transparent !important;
    color: var(--text-secondary) !important;
    border-bottom: 1px solid var(--border-color) !important;
    font-weight: bold;
    font-size: 0.9rem;
}

.v-table td {
    background: transparent !important;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color);
}

/* Light theme table styling */
.v-theme--light .v-table th {
    color: rgba(0, 0, 0, 0.6) !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.v-theme--light .v-table td {
    color: rgba(0, 0, 0, 0.87);
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* Dark theme table styling */
.v-theme--dark .v-table th {
    color: rgba(255, 255, 255, 0.6) !important;
    border-bottom: 1px solid #333 !important;
}

.v-theme--dark .v-table td {
    color: rgba(255, 255, 255, 0.87);
    border-bottom: 1px solid #333;
}

@media (max-width: 768px) {
    .exchange-portal {
        padding: 1rem 0;
    }
    
    .rate-display {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .rate-actions {
        margin-top: 1rem;
        width: 100%;
    }
    
    .rate-actions .v-btn {
        width: 100%;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .section-header .v-btn {
        margin-top: 1rem;
        align-self: flex-end;
    }
}
</style> 