<template>
    <v-card class="flex-grow-1">
        <v-card-text v-if="syncStatus">
            <v-alert v-if="errorMessage" density="compact" text type="error">{{ errorMessage }}</v-alert>
            <!-- Remove subscription checks - always show sync controls -->
            <div>
                <b class="text-success" v-if="isSyncActive">Your explorer is synchronizing blocks.</b>
                <b class="text-error" v-else-if="isSyncStopped">
                    Your explorer is not synchronizing blocks.
                    <span v-if="isRpcUnreachable"> RPC is unreachable.</span>
                </b>
                <b class="text-warning" v-else-if="isSyncStarting">Starting synchronization...</b>
                <b class="text-warning" v-else-if="isSyncStopping">Stopping synchronization...</b>
                <b class="text-error" v-else>Unknown synchronization status ({{ syncStatus }}).</b>
            </div>
            <v-btn v-if="isSyncActive" :loading="loading" class="mt-2" color="primary" @click="stopSync()">Stop Sync</v-btn>
            <v-btn v-else :loading="loading" class="mt-2" color="primary" @click="startSync()">Start Sync</v-btn>
        </v-card-text>
        <v-card-text v-else>
            <v-skeleton-loader type="list-item-three-line"></v-skeleton-loader>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapStores } from 'pinia';
import { useEnvStore } from '../stores/env';

export default {
    name: 'ExplorerSync',
    props: ['explorer'],
    data: () => ({
        loading: false,
        syncStatus: null,
        errorMessage: null,
        timeout: null
    }),
    mounted() {
        this.getSyncStatus();
    },
    destroyed() {
        if (this.timeout)
            clearTimeout(this.timeout);
    },
    methods: {
        getSyncStatus() {
            this.loading = true;
            this.$server.getExplorerSyncStatus(this.explorer.id)
                .then(({ data: { status }}) => this.syncStatus = status)
                .catch(console.log)
                .finally(() => this.loading = false);
        },
        stopSync() {
            this.loading = true;
            this.errorMessage = null;
            this.$server.stopExplorerSync(this.explorer.id)
                .then(() => this.waitForStatus('stopped'))
                .catch(error => {
                    console.log(error);
                    this.loading = false;
                });
        },
        startSync() {
            this.loading = true;
            this.errorMessage = null;
            this.$server.startExplorerSync(this.explorer.id)
                .then(() => this.waitForStatus('online'))
                .catch(error => {
                    this.errorMessage = error.response && error.response.data || 'Error while starting sync. Please retry.';
                    this.loading = false;
                });
        },
        waitForStatus(newStatus) {
            // Starting/Stoppping sync will enqueue a process. So we need to fetch the status until we get what we expect
            this.$server.getExplorerSyncStatus(this.explorer.id)
                .then(({ data: { status }}) => {
                    this.syncStatus = status;
                    // Remove transaction quota check from sync status
                    // if (this.hasReachedTransactionQuota) {
                    //     this.loading = false;
                    //     this.errorMessage = null;
                    // }
                    if (status != newStatus && newStatus == 'online') {
                        if (this.isRpcUnreachable) this.loading = false;
                        else this.timeout = setTimeout(() => this.waitForStatus(newStatus), 1000);
                    }
                    else if (status != newStatus)
                        setTimeout(() => this.waitForStatus(newStatus), 1000);
                    else {
                        this.loading = false;
                        this.errorMessage = null;
                    }
                })
                .catch(error => {
                    console.log(error);
                    this.loading = false;
                });
        }
    },
    computed: {
        ...mapStores(useEnvStore),
        isSyncActive() { return this.syncStatus == 'online' },
        isSyncStarting() { return this.syncStatus == 'launching' },
        isSyncStopping() { return this.syncStatus == 'stopping' },
        isSyncStopped() { return this.syncStatus == 'stopped' || this.syncStatus == 'unreachable' },
        isRpcUnreachable() { return this.syncStatus == 'unreachable' },
        hasReachedTransactionQuota() { return this.syncStatus == 'transactionQuotaReached' }
    }
}
</script>
