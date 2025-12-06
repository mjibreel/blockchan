# 🔐 Qubic File Stamp

A blockchain-based file authentication system that proves file ownership and authenticity using cryptographic hashing and smart contracts on Polygon.

## 🎯 What It Does

- **Upload & Stamp**: Users upload files and get a permanent blockchain timestamp
- **Verify Authenticity**: Anyone can verify if a file is authentic and when it was created
- **Privacy-First**: Only file hashes are stored on-chain, not the actual files
- **Immutable Proof**: Once stamped, the record cannot be altered or deleted
- **Public/Private Stamps**: Choose if your stamp is publicly verifiable or private
- **Download Proof**: Get your proof as PDF or JSON

## 🏗️ Architecture

```
User Uploads File
    ↓
Backend generates SHA-256 hash
    ↓
Smart contract stores: hash + owner + timestamp
    ↓
User receives proof of authenticity
    ↓
Anyone can verify by re-hashing and checking blockchain
```

## 🛠️ Tech Stack

- **Frontend**: React.js + Tailwind CSS + Ethers.js
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Polygon Amoy Testnet
- **Smart Contract**: Solidity (Hardhat)
- **Web3**: Ethers.js v6

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier)
- MetaMask browser extension
- Alchemy account (for RPC)
- Test MATIC (from Polygon faucet)

### Step 1: Clone & Install

```bash
# Install contract dependencies
cd contracts
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Set Up Supabase

1. Go to https://supabase.com/ and create a project
2. Copy your Project URL and Service Role Key
3. Go to SQL Editor and run:

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

### Step 3: Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=0x... (after deployment)
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CHAIN_ID=80002
REACT_APP_POLYGONSCAN_URL=https://amoy.polygonscan.com
```

**Contracts** (`contracts/.env`):
```env
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
```

### Step 4: Deploy Smart Contract

```bash
cd contracts
npm run compile
npm run deploy:amoy
```

Copy the contract address to `backend/.env` as `CONTRACT_ADDRESS`.

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Visit http://localhost:3000

## 📁 Project Structure

```
block/
├── contracts/          # Smart contracts
│   ├── contracts/      # Solidity files
│   ├── scripts/        # Deployment scripts
│   └── hardhat.config.js
│
├── backend/            # Express API
│   ├── routes/         # API routes
│   ├── utils/          # Hashing, blockchain, Supabase
│   └── server.js
│
├── frontend/           # React app
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Home, Stamp, Verify
│   │   ├── context/   # Wallet context
│   │   └── App.js
│   └── public/
│
├── PRD.md              # Product Requirements
├── SETUP_GUIDE.md      # Detailed setup guide
└── README.md           # This file
```

## 🎯 Features

- ✅ File upload and SHA-256 hashing
- ✅ Blockchain timestamping on Polygon
- ✅ Ownership verification
- ✅ Public file verification (no wallet needed)
- ✅ Public/Private stamp toggle
- ✅ Download proof as JSON/PDF
- ✅ Transaction history on PolygonScan
- ✅ Responsive UI with dark mode support
- ✅ MetaMask wallet integration

## 🔧 API Endpoints

- `POST /api/stamp` - Upload file and stamp on blockchain
- `POST /api/verify` - Verify file authenticity
- `GET /api/stamps/:address` - Get all stamps for an address
- `GET /health` - Health check

## 📝 Smart Contract Functions

- `stampFile(bytes32 fileHash, bool isPublic)` - Store file hash
- `verifyFile(bytes32 fileHash)` - Verify if hash exists
- `getStampInfo(bytes32 fileHash)` - Get complete stamp info
- `fileExists(bytes32 fileHash)` - Boolean check

## 🏆 Hackathon Pitch Points

1. **Problem**: How do you prove a file is authentic and when it was created?
2. **Solution**: Blockchain timestamping with cryptographic hashing
3. **Why Blockchain**: Immutable, decentralized, no single point of failure
4. **Privacy**: Only hashes stored, not files
5. **Cost**: Polygon = near-zero gas fees
6. **Demo**: Show upload → stamp → verify → PolygonScan link

## 🔒 Security & Privacy

- ✅ Only hashes stored on-chain (not files)
- ✅ Private stamps require wallet to verify
- ✅ No file content stored in database
- ✅ Wallet connection via MetaMask (secure)
- ✅ Input validation on file uploads

## 📚 Documentation

- See `PRD.md` for full product requirements
- See `SETUP_GUIDE.md` for detailed setup instructions

## 🐛 Troubleshooting

### "Insufficient funds" error
→ Get more test MATIC from https://faucet.polygon.technology/

### "Network error" when connecting
→ Check RPC URL in .env
→ Verify Alchemy API key

### "Contract not found"
→ Make sure contract is deployed
→ Check CONTRACT_ADDRESS in backend .env

### Supabase connection fails
→ Check SUPABASE_URL and SUPABASE_SERVICE_KEY
→ Verify table exists in Supabase dashboard

## 📝 License

MIT

## 🚀 Built For Hackathon

This project was built for a 48-hour hackathon. Focus on working demo over extra features.

---

**Ready to stamp your files? Let's go! 🔐**

