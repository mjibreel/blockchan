# Backend Environment Setup

Your Supabase credentials are already configured! Just add the blockchain settings.

## Current Configuration ✅

Your `backend/.env` should have:
```env
PORT=3001
SUPABASE_URL=https://iefjcektsnoyrontolno.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZmpjZWt0c25veXJvbnRvbG5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAxOTcxNCwiZXhwIjoyMDgwNTk1NzE0fQ.6LY-kk0qv7R78ch0bRHqTU0DboHJblaIz4mLGnWz5bc
```

## What You Need to Add

Add these lines to `backend/.env`:

```env
# Blockchain
PRIVATE_KEY=your_wallet_private_key_here
RPC_URL=https://rpc-amoy.polygon.technology
CHAIN_ID=80002

# Smart Contract (add after deployment)
CONTRACT_ADDRESS=0x...your_contract_address...
```

## How to Get These Values

1. **PRIVATE_KEY**: 
   - MetaMask → Account → Settings → Security → Export Private Key
   - ⚠️ Keep this secret!

2. **RPC_URL**: 
   - Sign up at https://www.alchemy.com/
   - Create app → Polygon → Mumbai
   - Copy API key URL

3. **CONTRACT_ADDRESS**: 
   - Will get this after deploying the contract

