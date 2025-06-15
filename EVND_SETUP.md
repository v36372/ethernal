# eVND Contract Address Management

This system allows you to store and manage contract addresses for the eVND (Vietnam e-VND CBDC) system in your Ethernal workspace.

## Overview

The eVND system stores contract addresses for:

- **💰 e-VND Token**: Main token contract
- **🔄 Exchange Portal**: Currency exchange contract  
- **📋 Entity Registry**: Entity verification contract
- **⚖️ Compliance Registry**: Compliance rules contract
- **💵 mUSD**: USD token contract

## Database Setup

Create the contracts table by running the migration:

```bash
# Method 1: Using Node.js directly (recommended)
cd run && node -e "
const { EvndContract } = require('./models');
EvndContract.sync().then(() => {
  console.log('✅ eVND contracts table created');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
"

# Method 2: If you have Sequelize CLI configured
npx sequelize-cli db:migrate --migrations-path run/migrations
```

## API Endpoints

### Get All Contracts
```bash
GET /api/evnd/contracts?workspace=<workspace_name>
Authorization: Bearer <your_token>
```

**Or using curl:**
```bash
curl -X GET "http://localhost:8888/api/evnd/contracts?workspace=YOUR_WORKSPACE_NAME" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "contracts": {
    "evnd_token": {
      "name": "e-VND Token",
      "icon": "💰",
      "address": "0xDc64...C6C9",
      "fullAddress": "0xDc6454B9F2F83b2A0F4b30D3C1c33F30c2C6C9"
    },
    "exchange_portal": {
      "name": "Exchange Portal", 
      "icon": "🔄",
      "address": "0x0B30...7016",
      "fullAddress": "0x0B30a94F3E0b72A8D89cFF0F6C1c7016"
    }
  }
}
```

### Update Multiple Contracts
```bash
PUT /api/evnd/contracts
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "contracts": {
    "evnd_token": {
      "name": "e-VND Token",
      "address": "0xDc6454B9F2F83b2A0F4b30D3C1c33F30c2C6C9",
      "icon": "💰"
    },
    "exchange_portal": {
      "name": "Exchange Portal",
      "address": "0x0B30a94F3E0b72A8D89cFF0F6C1c7016", 
      "icon": "🔄"
    },
    "entity_registry": {
      "name": "Entity Registry",
      "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "icon": "📋"
    },
    "compliance_registry": {
      "name": "Compliance Registry", 
      "address": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      "icon": "⚖️"
    },
    "musd": {
      "name": "mUSD",
      "address": "0x9A6743acD9A1C8e8a2B67e72f3d3a4C2c3c7508",
      "icon": "💵"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contracts updated successfully",
  "contracts": [
    {
      "contractType": "evnd_token",
      "name": "e-VND Token", 
      "address": "0xDc6454B9F2F83b2A0F4b30D3C1c33F30c2C6C9",
      "icon": "💰",
      "created": false
    }
  ]
}
```

### Update Single Contract
```bash
PUT /api/evnd/contracts/evnd_token
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "e-VND Token v2",
  "address": "0xNewTokenAddress123456789abcdef123456789abcdef12345678",
  "icon": "💰"
}
```

**Response:**
```json
{
  "success": true,
  "message": "evnd_token updated successfully",
  "contract": {
    "contractType": "evnd_token",
    "name": "e-VND Token v2",
    "address": "0xNewTokenAddress123456789abcdef123456789abcdef12345678", 
    "icon": "💰",
    "created": false
  }
}
```

### Delete Contract
```bash
DELETE /api/evnd/contracts/evnd_token
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "success": true,
  "message": "evnd_token deleted successfully"
}
```

### Get Dashboard Data
```bash
GET /api/evnd/dashboard?workspace=<workspace_name>
Authorization: Bearer <your_token>
```

**Or using curl:**
```bash
curl -X GET "http://localhost:8888/api/evnd/dashboard?workspace=YOUR_WORKSPACE_NAME" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "systemStatus": "VIETNAM e-VND CBDC SYSTEM STATUS",
  "systemComponents": {
    "evnd_token": {
      "name": "e-VND Token",
      "icon": "💰",
      "address": "0xDc64...C6C9",
      "fullAddress": "0xDc6454B9F2F83b2A0F4b30D3C1c33F30c2C6C9"
    },
    "exchange_portal": {
      "name": "Exchange Portal",
      "icon": "🔄", 
      "address": "0x0B30...7016",
      "fullAddress": "0x0B30a94F3E0b72A8D89cFF0F6C1c7016"
    },
    "entity_registry": {
      "name": "Entity Registry",
      "icon": "📋",
      "address": "0x5FbD...0aa3", 
      "fullAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    },
    "compliance_registry": {
      "name": "Compliance Registry",
      "icon": "⚖️",
      "address": "0xCf7E...0Fc9",
      "fullAddress": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    },
    "musd": {
      "name": "mUSD",
      "icon": "💵",
      "address": "0x9A67...7508",
      "fullAddress": "0x9A6743acD9A1C8e8a2B67e72f3d3a4C2c3c7508"
    }
  },
  "systemMetrics": {
    "totalEvndSupply": {
      "label": "Total e-VND Supply", 
      "value": "1,000,000,000 VND",
      "rawValue": 1000000000
    },
    "verifiedEntities": {
      "label": "Verified Entities",
      "value": "1,247 verified", 
      "rawValue": 1247
    },
    "dailyTransactions": {
      "label": "Daily Transactions",
      "value": "12,450",
      "rawValue": 12450
    },
    "complianceRules": {
      "label": "Compliance Rules",
      "value": "5 active",
      "rawValue": 5
    },
    "exchangeRate": {
      "label": "Exchange Rate",
      "value": "1 USD = 24,000 VND",
      "usdToVnd": 24000
    }
  },
  "verifiers": [
    {
      "address": "0x7099...79C8",
      "fullAddress": "0x7099B1E00D8b9aaEc2A87AaE0b1eA9Be79C8",
      "name": "Ministry of Finance",
      "status": "Active",
      "isActive": true
    },
    {
      "address": "0x3C44...93BC", 
      "fullAddress": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      "name": "State Bank Vietnam",
      "status": "Active",
      "isActive": true
    }
  ],
  "exchangePortalStatus": {
    "currentRates": {
      "usdToVnd": 24000,
      "lastUpdated": "2 min ago",
      "displayText": "1 USD = 24,000 e-VND"
    },
    "moneyFlowAnalytics": {
      "today": {
        "inflow": "+125M e-VND inflow",
        "transactions": "2,340 transactions"
      },
      "thisMonth": {
        "net": "+2.1B e-VND net", 
        "transactions": "45,600 transactions"
      },
      "thisYear": {
        "net": "+12.5B e-VND net",
        "transactions": "891,200 transactions"
      }
    }
  }
}
```

## Valid Contract Types

The following contract types are supported:

| Type | Description | Icon |
|------|-------------|------|
| `evnd_token` | e-VND Token | 💰 |
| `exchange_portal` | Exchange Portal | 🔄 |
| `entity_registry` | Entity Registry | 📋 |
| `compliance_registry` | Compliance Registry | ⚖️ |
| `musd` | mUSD | 💵 |

## Usage Examples

### Quick Setup
```bash
# Create table
cd run && node -e "require('./models').EvndContract.sync().then(() => process.exit(0))"

# Add all contracts at once
curl -X PUT "https://your-app.com/api/evnd/contracts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contracts": {
      "evnd_token": {
        "name": "e-VND Token",
        "address": "0xDc6454B9F2F83b2A0F4b30D3C1c33F30c2C6C9",
        "icon": "💰"
      },
      "exchange_portal": {
        "name": "Exchange Portal", 
        "address": "0x0B30a94F3E0b72A8D89cFF0F6C1c7016",
        "icon": "🔄"
      }
    }
  }'
```

### Update Single Contract  
```bash
curl -X PUT "https://your-app.com/api/evnd/contracts/evnd_token" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "e-VND Token v2",
    "address": "0xNewAddress123456789abcdef123456789abcdef123456789", 
    "icon": "💰"
  }'
```

## Error Handling

The API returns appropriate HTTP status codes:

- **200**: Success
- **400**: Bad request (invalid data)
- **404**: Contract not found  
- **500**: Server error

**Error Response Format:**
```json
{
  "error": "Invalid Ethereum address for evnd_token"
}
```

## Security Notes

- All Ethereum addresses are validated against the format `^0x[a-fA-F0-9]{40}$`
- Workspace authentication is required for all endpoints
- Contract types are restricted to predefined values
- Database constraints prevent duplicate contract types per workspace 