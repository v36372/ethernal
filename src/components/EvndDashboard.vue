<template>
    <v-container fluid class="evnd-dashboard">
        <v-row>
            <v-col cols="12">
                <!-- Main Dashboard Card -->
                <v-card class="dashboard-card" elevation="2">
                    <v-card-text class="pa-6">
                        <!-- System Status Title -->
                        <div class="system-status-header mb-6">
                            <v-icon class="mr-3" size="28">🏛️</v-icon>
                            <h2 class="text-h5 font-weight-bold">{{ dashboardData?.systemStatus || 'Loading...' }}</h2>
                        </div>

                        <v-row>
                            <!-- System Components -->
                            <v-col cols="12" md="6">
                                <v-card class="components-card" elevation="1">
                                    <v-card-text class="pa-4">
                                        <div v-if="dashboardData?.systemComponents" class="component-list">
                                            <div
                                                v-for="(component, key) in dashboardData.systemComponents"
                                                :key="key"
                                                class="component-row mb-3"
                                            >
                                                <div class="d-flex align-center">
                                                    <span class="component-icon mr-3">{{ component.icon }}</span>
                                                    <span class="component-name mr-4">{{ component.name }}</span>
                                                    <v-chip
                                                        :text="component.address"
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        class="component-address"
                                                        @click="navigateToAddress(component.fullAddress)"
                                                        @click.middle="copyToClipboard(component.fullAddress)"
                                                    ></v-chip>
                                                </div>
                                            </div>
                                        </div>
                                        <v-skeleton-loader v-else type="list-item@5"></v-skeleton-loader>
                                    </v-card-text>
                                </v-card>
                            </v-col>

                            <!-- System Metrics -->
                            <v-col cols="12" md="6">
                                <v-card class="metrics-card" elevation="1">
                                    <v-card-text class="pa-4">
                                        <div class="metrics-header mb-4">
                                            <v-icon class="mr-2" size="24">📊</v-icon>
                                            <h3 class="text-h6 font-weight-bold">System Metrics</h3>
                                        </div>
                                        <div v-if="dashboardData?.systemMetrics" class="metrics-list">
                                            <div
                                                v-for="(metric, key) in dashboardData.systemMetrics"
                                                :key="key"
                                                class="metric-row mb-3"
                                            >
                                                <div class="d-flex justify-space-between align-center">
                                                    <span class="metric-label">{{ metric.label }}:</span>
                                                    <span class="metric-value font-weight-bold">{{ metric.value }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <v-skeleton-loader v-else type="list-item@5"></v-skeleton-loader>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <!-- Verifier Section -->
                <v-card class="dashboard-card mt-6" elevation="2" v-if="dashboardData?.verifiers">
                    <v-card-text class="pa-6">
                        <div class="section-header mb-6">
                            <v-icon class="mr-3" size="28">👥</v-icon>
                            <h2 class="text-h5 font-weight-bold">Verifier Section</h2>
                        </div>

                        <v-card class="components-card" elevation="1">
                            <v-card-text class="pa-4">
                                <div class="verifier-header mb-4">
                                    <v-icon class="mr-2" size="20">🔘</v-icon>
                                    <h3 class="text-h6 font-weight-bold">AUTHORIZED VERIFIERS</h3>
                                </div>
                                
                                <v-table class="verifier-table">
                                    <thead>
                                        <tr>
                                            <th class="text-left">Address</th>
                                            <th class="text-left">Name</th>
                                            <th class="text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="verifier in dashboardData.verifiers" :key="verifier.fullAddress">
                                            <td>
                                                <v-chip
                                                    :text="verifier.address"
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    class="component-address"
                                                    @click="navigateToAddress(verifier.fullAddress)"
                                                ></v-chip>
                                            </td>
                                            <td class="verifier-name">{{ verifier.name }}</td>
                                            <td>
                                                <v-chip
                                                    size="small"
                                                    :color="verifier.isActive ? 'success' : 'error'"
                                                    variant="flat"
                                                >
                                                    <v-icon size="16" class="mr-1">
                                                        {{ verifier.isActive ? 'mdi-check' : 'mdi-close' }}
                                                    </v-icon>
                                                    {{ verifier.status }}
                                                </v-chip>
                                            </td>
                                        </tr>
                                    </tbody>
                                </v-table>
                            </v-card-text>
                        </v-card>
                    </v-card-text>
                </v-card>

                <!-- Exchange Portal Status -->
                <v-card class="dashboard-card mt-6" elevation="2" v-if="dashboardData?.exchangePortalStatus">
                    <v-card-text class="pa-6">
                        <div class="section-header mb-6">
                            <v-icon class="mr-3" size="28">🔄</v-icon>
                            <h2 class="text-h5 font-weight-bold">EXCHANGE PORTAL STATUS</h2>
                        </div>

                        <!-- Current Rates Section -->
                        <v-card class="components-card mb-4" elevation="1">
                            <v-card-text class="pa-4">
                                <div class="exchange-section">
                                    <h4 class="text-h6 font-weight-bold mb-3">Current Rates (Government Controlled):</h4>
                                    <div class="rate-display">
                                        <span class="rate-bullet">•</span>
                                        <span class="rate-text">{{ dashboardData.exchangePortalStatus.currentRates.displayText }}</span>
                                        <span class="rate-updated">(Updated: {{ dashboardData.exchangePortalStatus.currentRates.lastUpdated }})</span>
                                    </div>
                                </div>
                            </v-card-text>
                        </v-card>

                        <!-- Money Flow Analytics -->
                        <v-card class="components-card" elevation="1">
                            <v-card-text class="pa-4">
                                <div class="analytics-header mb-4">
                                    <v-icon class="mr-2" size="24">📊</v-icon>
                                    <h4 class="text-h6 font-weight-bold">Money Flow Analytics</h4>
                                </div>
                                <div class="analytics-grid">
                                    <div class="analytics-row">
                                        <span class="analytics-period">Today:</span>
                                        <span class="analytics-flow">{{ dashboardData.exchangePortalStatus.moneyFlowAnalytics.today.inflow }}</span>
                                        <span class="analytics-separator">|</span>
                                        <span class="analytics-transactions">{{ dashboardData.exchangePortalStatus.moneyFlowAnalytics.today.transactions }}</span>
                                    </div>
                                    <div class="analytics-row">
                                        <span class="analytics-period">This Month:</span>
                                        <span class="analytics-flow">{{ dashboardData.exchangePortalStatus.moneyFlowAnalytics.thisMonth.net }}</span>
                                        <span class="analytics-separator">|</span>
                                        <span class="analytics-transactions">{{ dashboardData.exchangePortalStatus.moneyFlowAnalytics.thisMonth.transactions }}</span>
                                    </div>
                                    <div class="analytics-row">
                                        <span class="analytics-period">This Year:</span>
                                        <span class="analytics-flow">{{ dashboardData.exchangePortalStatus.moneyFlowAnalytics.thisYear.net }}</span>
                                        <span class="analytics-separator">|</span>
                                        <span class="analytics-transactions">{{ dashboardData.exchangePortalStatus.moneyFlowAnalytics.thisYear.transactions }}</span>
                                    </div>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-card-text>
                </v-card>

                <!-- Loading State -->
                <div v-if="loading" class="text-center mt-4">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <p class="mt-2">Loading eVND dashboard data...</p>
                </div>

                <!-- Error State -->
                <v-alert v-if="error" type="error" class="mt-4">
                    {{ error }}
                </v-alert>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';

const $server = inject('$server');
const router = useRouter();

// Reactive data
const dashboardData = ref(null);
const loading = ref(true);
const error = ref(null);

// Methods
const fetchDashboardData = async () => {
    try {
        loading.value = true;
        error.value = null;
        
        const response = await $server.getEvndDashboard();
        dashboardData.value = response.data;
    } catch (err) {
        console.error('Error fetching eVND dashboard data:', err);
        error.value = 'Failed to load dashboard data. Please try again later.';
    } finally {
        loading.value = false;
    }
};

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        // Could add a toast notification here
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
    }
};

const navigateToAddress = (address) => {
    router.push(`/address/${address}`);
};

// Lifecycle
onMounted(() => {
    fetchDashboardData();
});
</script>

<style scoped>
.evnd-dashboard {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
    padding: 2rem 0;
}

.dashboard-header {
    display: flex;
    align-items: center;
    color: #2c3e50;
    margin-bottom: 2rem;
}

.dashboard-card {
    background: #1a1a1a;
    color: #ffffff;
    border-radius: 12px;
    border: 2px solid #333;
}

.system-status-header,
.section-header {
    display: flex;
    align-items: center;
    color: #ffffff;
    padding-bottom: 1rem;
    border-bottom: 1px solid #333;
}

.components-card,
.metrics-card {
    background: #2a2a2a;
    color: #ffffff;
    border-radius: 8px;
    border: 1px solid #444;
}

.component-list {
    font-family: 'Courier New', monospace;
}

.component-row {
    padding: 0.5rem 0;
    border-bottom: 1px solid #333;
}

.component-row:last-child {
    border-bottom: none;
}

.component-icon {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
}

.component-name {
    min-width: 180px;
    font-weight: 500;
}

.component-address {
    cursor: pointer;
    transition: all 0.2s ease;
}

.component-address:hover {
    background-color: rgba(var(--v-theme-primary), 0.1);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metrics-header {
    display: flex;
    align-items: center;
    color: #ffffff;
}

.metrics-list {
    font-family: 'Courier New', monospace;
}

.metric-row {
    padding: 0.5rem 0;
    border-bottom: 1px solid #333;
}

.metric-row:last-child {
    border-bottom: none;
}

.metric-label {
    color: #cccccc;
}

.metric-value {
    color: #ffffff;
}

/* Verifier Section Styles */
.verifier-header {
    display: flex;
    align-items: center;
    color: #ffffff;
}

.verifier-table {
    background: transparent !important;
    color: #ffffff;
    font-family: 'Courier New', monospace;
}

.verifier-table th {
    background: transparent !important;
    color: #cccccc !important;
    border-bottom: 1px solid #333 !important;
    font-weight: bold;
    font-size: 0.9rem;
}

.verifier-table td {
    background: transparent !important;
    color: #ffffff;
    border-bottom: 1px solid #333;
    padding: 12px 8px;
}

.verifier-name {
    font-weight: 500;
    min-width: 200px;
}

/* Exchange Portal Styles */
.exchange-section {
    color: #ffffff;
    font-family: 'Courier New', monospace;
}

.rate-display {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
}

.rate-bullet {
    color: #ffffff;
    font-size: 1.2rem;
}

.rate-text {
    color: #ffffff;
    font-weight: 500;
}

.rate-updated {
    color: #cccccc;
    font-style: italic;
}

.analytics-header {
    display: flex;
    align-items: center;
    color: #ffffff;
}

.analytics-grid {
    font-family: 'Courier New', monospace;
    color: #ffffff;
}

.analytics-row {
    display: grid;
    grid-template-columns: 120px 1fr auto 1fr;
    gap: 16px;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #333;
}

.analytics-row:last-child {
    border-bottom: none;
}

.analytics-period {
    color: #cccccc;
    font-weight: 500;
}

.analytics-flow {
    color: #ffffff;
    font-weight: bold;
}

.analytics-separator {
    color: #666;
    text-align: center;
}

.analytics-transactions {
    color: #cccccc;
}

/* Dark theme adjustments */
.v-theme--dark .evnd-dashboard {
    background: #121212;
}

.v-theme--dark .dashboard-header {
    color: #ffffff;
}
</style> 