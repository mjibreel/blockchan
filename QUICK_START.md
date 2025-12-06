# 🚀 Quick Start Guide - Qubic File Stamp

You've already set up Supabase! Now let's get everything running.

## ✅ What You Have

- ✅ Supabase database configured
- ✅ MetaMask wallet created
- ⏳ Need: Test MATIC tokens (see GET_TEST_MATIC.md)
- ⏳ Need: Alchemy account for RPC

## 📋 Step-by-Step Setup

### Step 1: Get Test MATIC Tokens

See `GET_TEST_MATIC.md` for detailed instructions.

**Quick version:**
1. Add Polygon Amoy to MetaMask (Chain ID: 80002) - **NOT Mumbai (deprecated)!**
2. Copy your wallet address from MetaMask
3. Go to https://faucet.polygon.technology/
4. Select **"Amoy"** → "MATIC Token" → Paste address → Submit
5. Wait 1-2 minutes, check MetaMask balance

### Step 2: Get Alchemy Account (Free)

1. Go to https://www.alchemy.com/
2. Sign up (free)
3. Create new app:
   - Network: Polygon
   - Chain: Amoy (or Mumbai if Amoy not available - use public RPC instead)
4. Copy your API key OR use public RPC: `https://rpc-amoy.polygon.technology`

### Step 3: Get Your Wallet Private Key (For Backend)

⚠️ **IMPORTANT**: Use a separate wallet for development, not your main wallet!

1. Open MetaMask
2. Click account icon → Settings → Security & Privacy
3. Click "Export Private Key"
4. Enter password
5. Copy the private key (starts with `0x...`)
6. **Keep this SECRET!** Never share it.

### Step 4: Install Dependencies

Open terminal in project root:

```bash
# Contracts
cd contracts
npm install

# Backend
cd ../backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 5: Configure Environment Files

#### A. Contracts (`contracts/.env`)

Create `contracts/.env`:
```env
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_wallet_private_key_from_metamask
```

#### B. Backend (`backend/.env`)

✅ Already configured with your Supabase credentials!

Just add:
```env
# Add these to backend/.env
PRIVATE_KEY=your_wallet_private_key_from_metamask
RPC_URL=https://rpc-amoy.polygon.technology
CHAIN_ID=80002
CONTRACT_ADDRESS=0x... (we'll get this after deployment)
```

#### C. Frontend (`frontend/.env`)

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CHAIN_ID=80001
REACT_APP_POLYGONSCAN_URL=https://mumbai.polygonscan.com
```

### Step 6: Create Supabase Table

1. Go to https://app.supabase.com/
2. Select your project
3. Go to "SQL Editor" → "New Query"
4. Paste this SQL:

```sql
CREATE TABLE stamps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_hash VARCHAR(64) UNIQUE NOT NULL,
  owner_address VARCHAR(42) NOT NULL,
  file_name VARCHAR(255),
  file_size BIGINT,
  timestamp TIMESTAMP NOT NULL,
  tx_id VARCHAR(66) NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_file_hash ON stamps(file_hash);
CREATE INDEX idx_owner_address ON stamps(owner_address);
```

5. Click "Run" ✅

### Step 7: Deploy Smart Contract

```bash
cd contracts
npm run compile
npm run deploy:amoy
```

**Copy the contract address** that appears (starts with `0x...`)

Add it to `backend/.env`:
```env
CONTRACT_ADDRESS=0x...your_contract_address_here...
```

### Step 8: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

Should see: `🚀 Server running on http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Should open http://localhost:3000 automatically

## 🎉 You're Ready!

1. Open http://localhost:3000
2. Click "Connect Wallet" (MetaMask)
3. Go to "Stamp" page
4. Upload a file
5. Click "Stamp File on Blockchain"
6. Approve transaction in MetaMask
7. Wait for confirmation
8. Download your proof! 🎊

## 🐛 Common Issues

### "Insufficient funds"
→ Get more MATIC from faucet (see GET_TEST_MATIC.md)

### "Network error"
→ Check RPC_URL in .env files
→ Verify Alchemy API key is correct

### "Contract not found"
→ Make sure contract is deployed
→ Check CONTRACT_ADDRESS in backend/.env

### "Supabase connection error"
→ Verify SUPABASE_URL and SUPABASE_SERVICE_KEY in backend/.env
→ Check if table exists in Supabase dashboard

## 📞 Quick Reference

- **Supabase Dashboard**: https://app.supabase.com/
- **Alchemy Dashboard**: https://dashboard.alchemy.com/
- **Polygon Faucet**: https://faucet.polygon.technology/
- **PolygonScan Amoy**: https://amoy.polygonscan.com/

---

**Need help? Check the error message and refer to troubleshooting section!** 🚀

