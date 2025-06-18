import { ref, computed, inject, onMounted } from 'vue';
import { useCurrentWorkspaceStore } from '@/stores/currentWorkspace';

export function useEvndContracts() {
    const currentWorkspaceStore = useCurrentWorkspaceStore();
    const $server = inject('$server');
    
    // Reactive state
    const evndContracts = ref({});
    const loading = ref(false);
    const error = ref(null);
    
    // Computed properties for specific contract types
    const evndTokenContract = computed(() => evndContracts.value.evnd_token || null);
    const entityRegistryContract = computed(() => evndContracts.value.entity_registry || null);
    const exchangePortalContract = computed(() => evndContracts.value.exchange_portal || null);
    const complianceRegistryContract = computed(() => evndContracts.value.compliance_registry || null);
    
    // Verifier contracts
    const verifierContracts = computed(() => {
        const verifiers = [];
        if (evndContracts.value.verifier_1) verifiers.push(evndContracts.value.verifier_1);
        if (evndContracts.value.verifier_2) verifiers.push(evndContracts.value.verifier_2);
        return verifiers;
    });
    
    // Compliance contracts
    const complianceContracts = computed(() => {
        const compliance = {};
        if (evndContracts.value.address_restriction_compliance) {
            compliance.addressRestriction = evndContracts.value.address_restriction_compliance;
        }
        if (evndContracts.value.verification_compliance) {
            compliance.verification = evndContracts.value.verification_compliance;
        }
        if (evndContracts.value.supply_compliance) {
            compliance.supply = evndContracts.value.supply_compliance;
        }
        if (evndContracts.value.transaction_type_compliance) {
            compliance.transactionType = evndContracts.value.transaction_type_compliance;
        }
        if (evndContracts.value.entity_type_compliance) {
            compliance.entityType = evndContracts.value.entity_type_compliance;
        }
        return compliance;
    });
    
    // Admin contracts
    const adminContracts = computed(() => {
        const admin = {};
        if (evndContracts.value.deployer_admin) {
            admin.deployer = evndContracts.value.deployer_admin;
        }
        if (evndContracts.value.proxy_admin) {
            admin.proxy = evndContracts.value.proxy_admin;
        }
        if (evndContracts.value.blacklister_1) {
            admin.blacklister1 = evndContracts.value.blacklister_1;
        }
        if (evndContracts.value.blacklister_2) {
            admin.blacklister2 = evndContracts.value.blacklister_2;
        }
        return admin;
    });
    
    // Check if eVND system is configured
    const hasEvndSystem = computed(() => {
        return Object.keys(evndContracts.value).length > 0;
    });
    
    // Check if we have the eVND token contract
    const hasEvndToken = computed(() => {
        const result = !!evndTokenContract.value?.fullAddress;
        console.log('🔍 useEvndContracts - hasEvndToken computed:', result, evndTokenContract.value);
        return result;
    });
    
    // Check if we have entity registry for verification
    const hasEntityRegistry = computed(() => {
        const result = !!entityRegistryContract.value?.fullAddress;
        console.log('🔍 hasEntityRegistry computed:', {
            result,
            entityRegistryContract: entityRegistryContract.value,
            fullAddress: entityRegistryContract.value?.fullAddress
        });
        return result;
    });
    
    // Get eVND token address for filtering
    const evndTokenAddress = computed(() => {
        return evndTokenContract.value?.fullAddress?.toLowerCase() || null;
    });
    
    // Get entity registry address for verification
    const entityRegistryAddress = computed(() => {
        return entityRegistryContract.value?.fullAddress || null;
    });
    
    // Check if a token transfer is an eVND transfer
    const isEvndTransfer = (transfer) => {
        if (!hasEvndToken.value || !transfer?.token) return false;
        return transfer.token.toLowerCase() === evndTokenAddress.value;
    };
    
    // Fetch contracts from API
    const fetchEvndContracts = async () => {
        if (!$server || loading.value) {
            console.log('🔄 fetchEvndContracts skipped:', { 
                hasServer: !!$server, 
                loading: loading.value 
            });
            return;
        }
        
        console.log('🔄 useEvndContracts - Starting fetchEvndContracts...');
        console.log('🔄 useEvndContracts - Current workspace ID:', currentWorkspaceStore.id);
        
        loading.value = true;
        error.value = null;
        
        try {
            const response = await $server.getEvndContracts();
            console.log('🔄 useEvndContracts - API response:', response);
            
            if (response.data?.success && response.data?.contracts) {
                evndContracts.value = response.data.contracts;
                console.log('✅ Fetched eVND contracts:', evndContracts.value);
                console.log('📋 Entity Registry found:', evndContracts.value.entity_registry);
                console.log('📋 Entity Registry address:', evndContracts.value.entity_registry?.fullAddress);
            } else {
                console.warn('No eVND contracts found or invalid response');
                console.warn('Response data:', response.data);
                evndContracts.value = {};
            }
        } catch (err) {
            console.error('Error fetching eVND contracts:', err);
            error.value = err.message || 'Failed to fetch eVND contracts';
            evndContracts.value = {};
        } finally {
            loading.value = false;
        }
    };
    
    // Refresh contracts
    const refreshContracts = () => {
        return fetchEvndContracts();
    };
    
    // Get contract by type
    const getContract = (contractType) => {
        return evndContracts.value[contractType] || null;
    };
    
    // Get all contracts of a category
    const getContractsByCategory = (category) => {
        switch (category) {
            case 'core':
                return {
                    evndToken: evndTokenContract.value,
                    exchangePortal: exchangePortalContract.value,
                    entityRegistry: entityRegistryContract.value,
                    complianceRegistry: complianceRegistryContract.value
                };
            case 'compliance':
                return complianceContracts.value;
            case 'admin':
                return adminContracts.value;
            case 'verifiers':
                return verifierContracts.value;
            default:
                return evndContracts.value;
        }
    };
    
    // Auto-fetch on mount if workspace is available
    onMounted(() => {
        if (currentWorkspaceStore.id) {
            fetchEvndContracts();
        }
    });
    
    return {
        // State
        evndContracts,
        loading,
        error,
        
        // Computed properties
        evndTokenContract,
        entityRegistryContract,
        exchangePortalContract,
        complianceRegistryContract,
        verifierContracts,
        complianceContracts,
        adminContracts,
        
        // Flags
        hasEvndSystem,
        hasEvndToken,
        hasEntityRegistry,
        
        // Addresses
        evndTokenAddress,
        entityRegistryAddress,
        
        // Methods
        isEvndTransfer,
        fetchEvndContracts,
        refreshContracts,
        getContract,
        getContractsByCategory
    };
} 