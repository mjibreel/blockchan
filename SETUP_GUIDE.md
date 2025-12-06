# 🚀 Setup Guide - Qubic File Stamp
## Everything You Need to Get Started

---

## 📋 Prerequisites Checklist

### 1. **Development Tools** ✅
- [ ] **Node.js** (v18 or higher)
  - Download: https://nodejs.org/
  - Verify: `node --version` in terminal

- [ ] **Code Editor**
  - VS Code (recommended): https://code.visualstudio.com/
  - Or any editor you prefer

- [ ] **Git** (optional but recommended)
  - Download: https://git-scm.com/
  - Verify: `git --version`

### 2. **Database** ✅
- [ ] **Supabase** ⭐ **RECOMMENDED** (PostgreSQL-based)
  - Sign up: https://supabase.com/
  - Create new project (free tier)
  - Get your:
    - Project URL: `https://your-project.supabase.co`
    - API Key (anon/public key)
    - Service Role Key (for backend - keep secret!)
  - Go to SQL Editor → Create the `stamps` table (see PRD.md for schema)
  - **Why Supabase?**
    - ✅ PostgreSQL (powerful SQL database)
    - ✅ Built-in REST API (can query directly from frontend)
    - ✅ Real-time subscriptions (if needed later)
    - ✅ Free tier: 500MB database, 2GB bandwidth
    - ✅ Easy setup, great docs
  
  - **Alternative: MongoDB Atlas**
    - Sign up: https://www.mongodb.com/cloud/atlas
    - Create free cluster (M0 - Free forever)
    - Get connection string

#### Quick Supabase Setup Steps:
1. Go to https://supabase.com/ → Sign up (free)
2. Click "New Project"
3. Fill in:
   - Project name: `qubic-stamp`
   - Database password: (save this!)
   - Region: Choose closest to you
4. Wait ~2 minutes for project to initialize
5. Go to **Settings** → **API**
   - Copy **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - Copy **service_role** key (for backend - keep secret!)
   - Copy **anon** key (for frontend if needed)
6. Go to **SQL Editor** → **New Query**
7. Paste this SQL to create the table:
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
8. Click **Run** → Table created! ✅

### 3. **Blockchain Setup** ✅

#### A. **MetaMask Wallet** (Required)
- [ ] Install MetaMask browser extension
  - Chrome: https://chrome.google.com/webstore/detail/metamask
  - Firefox: https://addons.mozilla.org/firefox/addon/ether-metamask/
- [ ] Create a new wallet (or use existing)
- [ ] **Save your seed phrase securely** ⚠️

#### B. **Polygon Mumbai Testnet** (Free Test Network)
- [ ] Add Polygon Mumbai to MetaMask:
  1. Open MetaMask
  2. Click network dropdown → "Add Network"
  3. Or use: https://chainlist.org/ (search "Polygon Mumbai")
  4. Network details:
     - **Network Name**: Mumbai
     - **RPC URL**: `https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY` (or use public RPC)
     - **Chain ID**: 80001
     - **Currency Symbol**: MATIC
     - **Block Explorer**: https://mumbai.polygonscan.com/

#### C. **Get Test MATIC** (Free Test Tokens)
- [ ] Use Polygon Faucet:
  - https://faucet.polygon.technology/
  - https://mumbaifaucet.com/
  - Enter your wallet address
  - Get free test MATIC (for gas fees)

#### D. **Blockchain Provider** (RPC Endpoint)
Choose ONE:

**Option 1: Alchemy** ⭐ **RECOMMENDED**
- [ ] Sign up: https://www.alchemy.com/
- [ ] Create new app → Select "Polygon" → "Mumbai"
- [ ] Copy your API key
- [ ] RPC URL: `https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY`

**Option 2: Infura**
- [ ] Sign up: https://infura.io/
- [ ] Create new project → Select "Polygon Mumbai"
- [ ] Copy your API key
- [ ] RPC URL: `https://polygon-mumbai.infura.io/v3/YOUR_API_KEY`

**Option 3: Public RPC** (Less reliable, but works)
- [ ] Use: `https://rpc-mumbai.maticvigil.com`
- [ ] No signup needed (but may be slower)

### 4. **Wallet Private Key** (For Backend)
- [ ] Export private key from MetaMask:
  1. MetaMask → Account → Settings → Security & Privacy
  2. Export Private Key (⚠️ **Keep this SECRET!**)
  3. This is for backend to send transactions
  4. **Use a separate wallet** (not your main one) for development

---

## 📦 Accounts You Need to Create

| Service | Purpose | Free? | Sign Up Link |
|---------|---------|-------|--------------|
| **Supabase** | Database (PostgreSQL) | ✅ Yes | https://supabase.com/ |
| **Alchemy** | Blockchain RPC | ✅ Yes | https://www.alchemy.com/ |
| **MetaMask** | Wallet | ✅ Yes | Browser extension |
| **Polygon Faucet** | Test tokens | ✅ Yes | https://faucet.polygon.technology/ |

---

## 🔑 Environment Variables You'll Need

### Backend `.env` file:
```env
# Server
PORT=3001

# Supabase (PostgreSQL)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
# OR use anon key if you prefer: SUPABASE_ANON_KEY=your_anon_key

# Alternative: MongoDB (if not using Supabase)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qubic-stamp

# Blockchain
PRIVATE_KEY=your_wallet_private_key_here
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
CHAIN_ID=80001

# Smart Contract (after deployment)
CONTRACT_ADDRESS=0x...your_contract_address...

# Optional
NODE_ENV=development
```

### Frontend `.env` file:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CHAIN_ID=80001
REACT_APP_POLYGONSCAN_URL=https://mumbai.polygonscan.com
```

---

## 📁 Project Structure (What We'll Build)

```
block/
├── frontend/              # React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Stamp, Verify, Home
│   │   ├── utils/         # Web3 helpers
│   │   └── App.js
│   ├── package.json
│   └── .env
│
├── backend/               # Express API
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   ├── models/            # Database models (Supabase/PostgreSQL)
│   ├── utils/             # Hashing, blockchain
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── contracts/             # Smart contracts
│   ├── contracts/         # Solidity files
│   ├── scripts/           # Deployment scripts
│   ├── hardhat.config.js
│   └── package.json
│
├── PRD.md                 # This document
├── SETUP_GUIDE.md         # This guide
└── README.md
```

---

## 🎯 Step-by-Step Setup (Once You Have Accounts)

### Step 1: Install Dependencies
```bash
# Backend
cd backend
npm install express @supabase/supabase-js dotenv ethers cors
# OR if using MongoDB: npm install express mongoose dotenv ethers cors

# Frontend
cd ../frontend
npm install react react-dom react-scripts ethers tailwindcss

# Contracts
cd ../contracts
npm install hardhat @nomicfoundation/hardhat-toolbox
```

### Step 2: Deploy Smart Contract
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network mumbai
# Copy the contract address to backend .env
```

### Step 3: Start Backend
```bash
cd backend
npm start
# Should run on http://localhost:3001
```

### Step 4: Start Frontend
```bash
cd frontend
npm start
# Should run on http://localhost:3000
```

---

## ✅ Pre-Flight Checklist

Before you start coding, make sure you have:

- [ ] Node.js installed
- [ ] Supabase account + project URL + service key
- [ ] Alchemy account + API key
- [ ] MetaMask installed + Mumbai testnet added
- [ ] Test MATIC in your wallet (from faucet)
- [ ] Wallet private key (for backend)
- [ ] All accounts ready to go

---

## 🆘 Troubleshooting

### "Insufficient funds" error
→ Get more test MATIC from faucet

### "Network error" when connecting
→ Check RPC URL in .env
→ Verify Alchemy/Infura API key

### "Contract not found"
→ Make sure contract is deployed
→ Check CONTRACT_ADDRESS in .env

### Supabase connection fails
→ Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env
→ Verify project is active in Supabase dashboard
→ Check if table exists (run SQL from PRD.md)

### MongoDB connection fails (if using MongoDB)
→ Check connection string
→ Whitelist your IP in MongoDB Atlas

---

## 🎬 Next Steps

1. ✅ Complete all prerequisites above
2. ✅ Create all accounts
3. ✅ Get test tokens
4. ✅ Ready to start coding!

---

## 📞 Quick Reference

- **Polygon Mumbai Explorer**: https://mumbai.polygonscan.com/
- **Polygon Faucet**: https://faucet.polygon.technology/
- **Alchemy Dashboard**: https://dashboard.alchemy.com/
- **Supabase Dashboard**: https://app.supabase.com/
- **MetaMask**: Browser extension

---

**Ready? Let's build! 🚀**

