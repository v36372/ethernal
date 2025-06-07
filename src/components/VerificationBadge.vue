<template>
    <div v-if="hasVerificationContract">
        <v-tooltip v-if="!isLoading">
            <template v-slot:activator="{ props }">
                <v-icon 
                    v-bind="props"
                    :size="size"
                    :color="isVerified ? 'success' : 'error'"
                    class="verification-badge"
                >
                    {{ isVerified ? 'mdi-check-decagram' : 'mdi-close-circle' }}
                </v-icon>
            </template>
            <span>{{ isVerified ? 'Verified Entity' : 'Unverified Entity' }}</span>
        </v-tooltip>
        <v-progress-circular
            v-else
            :size="size === 'x-small' ? '12' : '16'"
            width="2"
            indeterminate
            color="grey"
            class="verification-loading"
        ></v-progress-circular>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useVerification } from '@/composables/useVerification';

// Props
const props = defineProps({
    address: {
        type: String,
        required: true
    },
    size: {
        type: String,
        default: 'small'
    },
    autoCheck: {
        type: Boolean,
        default: true
    }
});

// Verification composable
const { hasVerificationContract, isAddressVerified, verifyAddress, clearVerificationCache } = useVerification();

// Reactive state
const isVerified = ref(false);
const isLoading = ref(false);

// Check verification status
const checkVerification = async () => {
    if (!props.address || !hasVerificationContract.value || isLoading.value) return;
    
    isLoading.value = true;
    
    try {
        // First check cache
        const cachedResult = isAddressVerified(props.address);
        if (cachedResult !== undefined && cachedResult !== null) {
            isVerified.value = Boolean(cachedResult);
            return;
        }
        
        // If not in cache, verify
        const result = await verifyAddress(props.address);
        isVerified.value = Boolean(result);
    } catch (error) {
        console.error('Error checking verification:', error);
        isVerified.value = false;
    } finally {
        isLoading.value = false;
    }
};

// Watch for address changes
watch(() => props.address, () => {
    if (props.autoCheck) {
        checkVerification();
    }
}, { immediate: true });

// Force refresh verification (clear cache and recheck)
const forceRefresh = async () => {
    clearVerificationCache();
    await checkVerification();
};

// Expose method for manual checking
defineExpose({
    checkVerification,
    forceRefresh,
    isVerified,
    isLoading
});
</script>

<style scoped>
.verification-badge {
    cursor: help;
    transition: transform 0.2s ease;
}

.verification-badge:hover {
    transform: scale(1.1);
}

.verification-loading {
    cursor: default;
}
</style> 