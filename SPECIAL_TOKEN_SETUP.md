# Special ERC20 Token Showcase

This feature allows you to highlight a specific ERC20 token throughout the Ethernal block explorer interface.

## Configuration

Set the environment variable `VITE_SPECIAL_TOKEN_ADDRESS` to the address of your ERC20 token:

```bash
export VITE_SPECIAL_TOKEN_ADDRESS=0xYourTokenAddressHere
```

Or add it to your `.env` file:

```
VITE_SPECIAL_TOKEN_ADDRESS=0xYourTokenAddressHere
```

## Features

When a special token is configured, the following elements will be highlighted:

### 1. Transaction List
- Transactions involving transfers of the special token will have a gold/amber colored left border and subtle background highlighting
- This applies to both the main transactions list and address-specific transaction lists

### 2. Token Balances
- In EOA (Externally Owned Account) pages, the special token balance will be highlighted with:
  - A star icon next to the token address
  - Bold, orange-colored balance text
  - A "SPECIAL" chip badge
  - Gold background highlighting for the entire row

### 3. Transaction Details
- In transaction detail pages, if the transaction contains special token transfers:
  - The "Token Transfers" section will have a gold background highlight
  - A "SPECIAL TOKEN" chip will appear next to the section title
  - Individual token transfers will show star icons and "SPECIAL" badges

### 4. Token Transfer Lists
- In dedicated token transfer pages and embedded transfer lists:
  - Special token transfers have gold highlighting
  - Star icons appear next to special token addresses
  - "SPECIAL" chip badges identify the special token
  - Compact transfer displays show special highlighting

## Styling

The highlighting uses a consistent gold/amber color scheme:
- Primary color: `#FFC107` (Amber)
- Background gradients with low opacity for subtle highlighting
- Border accents for clear visual distinction
- Star icons and chip badges for additional visual cues

## Default Fallback

If no `VITE_SPECIAL_TOKEN_ADDRESS` is configured, the system defaults to:
`0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`

To disable special token highlighting, set the environment variable to an empty string:
```bash
export VITE_SPECIAL_TOKEN_ADDRESS=""
``` 