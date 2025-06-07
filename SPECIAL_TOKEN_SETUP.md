# eVND Token Showcase & Verification System

This feature allows you to highlight a specific ERC20 token (eVND) throughout the Ethernal block explorer interface and verify entity addresses using a smart contract.

## Configuration

### eVND Token Configuration

Set the environment variable `VITE_SPECIAL_TOKEN_ADDRESS` to the address of your ERC20 token:

```bash
export VITE_SPECIAL_TOKEN_ADDRESS=0xYourTokenAddressHere
```

### Verification Contract Configuration

Set the environment variable `VITE_VERIFICATION_CONTRACT_ADDRESS` to the address of your verification contract:

```bash
export VITE_VERIFICATION_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### eVND Dashboard Verifier Configuration

Set the environment variables for verifier addresses displayed in the dashboard:

```bash
export VITE_VERIFIER_ADDRESS_1=0x7099B1E00D8b9aaEc2A87AaE0b1eA9Be79C8
export VITE_VERIFIER_ADDRESS_2=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

Or add all to your `.env` file:

```
VITE_SPECIAL_TOKEN_ADDRESS=0xYourTokenAddressHere
VITE_VERIFICATION_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_VERIFIER_ADDRESS_1=0x7099B1E00D8b9aaEc2A87AaE0b1eA9Be79C8
VITE_VERIFIER_ADDRESS_2=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

### Verification Contract Requirements

The verification contract must implement the following interface:

```solidity
function isVerifiedEntity(address _entity) external view returns (bool);
```

This function should return `true` if the address is a verified entity, `false` otherwise.

## Features

When the eVND token is configured, the following elements will be highlighted:

### 1. Transaction List
- Transactions involving transfers of the eVND token will have a gold/amber colored left border and subtle background highlighting
- This applies to both the main transactions list and address-specific transaction lists

### 2. Token Balances
- **In the "More Info" section**: eVND balance is prominently displayed at the top for quick access
  - Star icon and "eVND Balance" header
  - Bold, orange-colored balance amount
  - "eVND" chip badge for identification
  - Only appears when the address has an eVND balance

- **In the Assets tab**: eVND token balance will be highlighted with:
  - A star icon next to the token address
  - Bold, orange-colored balance text
  - An "eVND" chip badge
  - Gold background highlighting for the entire row

### 3. Transaction Details
- In transaction detail pages, if the transaction contains eVND token transfers:
  - The "Token Transfers" section will have a gold background highlight
  - An "eVND TOKEN" chip will appear next to the section title
  - Individual token transfers will show star icons and "eVND" badges

### 4. eVND Transfers Tab
- Dedicated "eVND Transfers" tab appears as the default tab on address pages (when eVND is configured)
- Shows only transfers involving the eVND token
- Features all the gold highlighting, star icons, and chip badges
- Prominently displays eVND-specific transfer activity

### 5. Address Verification
- **In the "More Info" section**: Shows verification status for EOA addresses
  - Green checkmark icon for verified entities
  - "Verified Entity" status text for verified addresses
  - "Not Verified" status for unverified addresses
  - Real-time verification checks against the configured smart contract

- **In eVND transfer lists**: Verification badges appear next to source and destination addresses
  - Small green checkmark icons for verified entities
  - Hover tooltip shows "Verified Entity" message

### 6. eVND Dashboard
- **Dedicated Dashboard**: Available at `/evnd-dashboard` and accessible from the main navigation
- **System Status**: Overview of eVND CBDC system components and addresses
- **Verifier Section**: Displays authorized verifiers with their addresses and status
  - Configurable verifier addresses through environment variables
  - Clickable address chips that navigate to address pages
  - Real-time status indicators (Active/Inactive)
- **Exchange Portal Status**: 
  - Current government-controlled exchange rates
  - Real-time money flow analytics with daily, monthly, and yearly statistics
  - Transaction volume tracking

## Styling

The highlighting uses a consistent gold/amber color scheme:
- Primary color: `#FFC107` (Amber)
- Background gradients with low opacity for subtle highlighting
- Border accents for clear visual distinction
- Star icons and chip badges for additional visual cues

## Default Values

### eVND Token
If no `VITE_SPECIAL_TOKEN_ADDRESS` is configured, the system defaults to:
`0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`

To disable eVND token highlighting, set the environment variable to an empty string:
```bash
export VITE_SPECIAL_TOKEN_ADDRESS=""
```

### Verification Contract
If no `VITE_VERIFICATION_CONTRACT_ADDRESS` is configured, the system defaults to:
`0x5FbDB2315678afecb367f032d93F642f64180aa3`

To disable verification features, set the environment variable to an empty string:
```bash
export VITE_VERIFICATION_CONTRACT_ADDRESS=""
```

## Testing Verification

You can test the verification system using the cast command:

```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "isVerifiedEntity(address) returns (bool)" 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f --rpc-url=localhost:8545
```

Replace the addresses with your actual verification contract and entity addresses. 