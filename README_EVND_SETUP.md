# eVND Token Transfer Setup Guide

## Overview
The eVND token transfer functionality is already implemented in Ethernal. To see eVND transfers on the address details page, you need to configure the eVND token contract via the API.

## Configuration Steps

### 1. Configure eVND Token Contract

Use the API to register your eVND token contract:

```bash
curl -X PUT "http://localhost:3005/api/evnd/contracts/evnd_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "eVND Token",
    "address": "0x67d269191c92caf3cd7723f116c85e6e9bf55933",
    "icon": "mdi-star"
  }'
```

### 2. Verify Configuration

Check if the eVND contract is properly configured:

```bash
curl "http://localhost:3005/api/evnd/contracts"
```

### 3. Test eVND Transfers API

Test the eVND transfers endpoint for a specific address:

```bash
curl "http://localhost:3005/api/addresses/0x67d269191c92caf3cd7723f116c85e6e9bf55933/evnd-transfers?page=1&itemsPerPage=10"
```

## How It Works

1. **Backend API** (`/api/addresses/:address/evnd-transfers`):
   - Finds the eVND token contract from `evnd_contracts` table
   - Queries `token_transfers` table for transfers involving that token and address
   - Returns paginated results with transaction details

2. **Frontend Components**:
   - `AddressEvndTransfers.vue` displays the eVND transfers table
   - `Address.vue` shows eVND tab when `hasEvndToken` is true
   - `useEvndToken` composable handles eVND token detection

3. **Database Models**:
   - `EvndContract` - stores eVND contract addresses per workspace
   - `TokenTransfer` - stores all token transfer data
   - `Transaction` - linked transaction details

## Troubleshooting

### "No eVND transfers found"
- Ensure eVND contract is configured (step 1)
- Check that token transfers exist for that token address
- Verify the token address matches exactly (case-insensitive)

### "No eVND token configured"  
- The eVND contract hasn't been registered via API
- Use the PUT endpoint above to configure it

### Token transfers exist but don't show
- Verify the `token` field in `token_transfers` table matches the configured eVND contract address
- Check that `workspaceId` matches between the contract and transfers 