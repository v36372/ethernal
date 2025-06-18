# eVND Transfers Debug Instructions

## Current Status
✅ **Backend API is implemented** - `/api/addresses/:address/evnd-transfers`  
✅ **Frontend components exist** - `AddressEvndTransfers.vue`  
✅ **Frontend integration done** - eVND tab in `Address.vue`  
❌ **eVND contract not configured** - This is the issue!

## Debug Steps

### 1. Check Browser Console
Open the URL: http://127.0.0.1:3002/address/0x67d269191c92caf3cd7723f116c85e6e9bf55933#evndtxns

Look for these debug messages in the browser console:
- `🔄 useEvndContracts - Starting fetchEvndContracts...`
- `🔍 useEvndContracts - hasEvndToken computed:` 
- `📱 Address.vue - hasEvndToken changed:`
- `🚀 AddressEvndTransfers component mounted`

### 2. Expected Behavior
If working correctly, you should see:
1. The eVND tab appears in the address page
2. When clicking the eVND tab, the AddressEvndTransfers component mounts
3. An API call is made to `/api/addresses/:address/evnd-transfers`
4. Either transfers are displayed or "No eVND transfers found"

### 3. Likely Issue: eVND Contract Not Configured

The `hasEvndToken` computed property will be `false` because:
- No eVND contract is configured in the database
- The API call to `/api/evnd/contracts` returns empty results

### 4. Fix: Configure eVND Contract

You need to configure the eVND contract via the API. From the browser's developer console, run:

```javascript
// Get the server instance from Vue devtools or console
const $server = window.Vue.currentApp.config.globalProperties.$server;

// Configure eVND contract
$server.updateEvndContract('evnd_token', {
    name: 'eVND Token',
    address: '0x67d269191c92caf3cd7723f116c85e6e9bf55933',
    icon: 'mdi-star'
}).then(response => {
    console.log('✅ eVND contract configured:', response.data);
    // Refresh the page to see the changes
    window.location.reload();
}).catch(error => {
    console.error('❌ Error:', error);
});
```

Or use the browser network tab to see what workspace/auth parameters are being used, then configure via API directly.

### 5. Alternative: Check Database Directly

If you have database access, check the `evnd_contracts` table:
```sql
SELECT * FROM evnd_contracts WHERE contractType = 'evnd_token';
```

### 6. Verify Fix

After configuring the eVND contract:
1. Refresh the page
2. The eVND tab should appear
3. Clicking it should trigger the API call
4. Check network tab for the API request to `/api/addresses/.../evnd-transfers`

## Quick Test

If the eVND tab doesn't appear, temporarily force it by modifying the Address.vue file:
```javascript
// In Address.vue, temporarily change:
<v-chip label size="small" value="evndtxns" v-if="hasEvndToken">
// To:
<v-chip label size="small" value="evndtxns" v-if="true">
```

This will force the tab to show, and you can see if the component loads and what errors occur. 