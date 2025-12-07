# 🔐 Qubic File Stamp

A blockchain-based file authentication system that proves file ownership and authenticity using cryptographic hashing and smart contracts on multiple EVM-compatible networks.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Smart Contracts](#smart-contracts)
- [Multi-Chain Support](#multi-chain-support)
- [Contributing](#contributing)

## 🎯 Overview

Qubic File Stamp allows users to create immutable proof of file ownership by storing file hashes on the blockchain. Only cryptographic hashes are stored on-chain—never the actual file content—ensuring privacy while providing permanent verification.

### How It Works

1. **Upload File**: User uploads a file and optionally adds a PIN
2. **Generate Hash**: System creates a SHA-256 hash (with PIN if provided)
3. **Stamp on Blockchain**: Hash is permanently stored on-chain with timestamp and owner
4. **Verify Anytime**: Anyone can verify file authenticity by re-hashing and checking blockchain

## ✨ Features

### Core Features
- ✅ **File Stamping**: Upload files and get blockchain timestamps
- ✅ **File Verification**: Verify file authenticity on-chain
- ✅ **Transaction History**: View, search, and download transaction history
- ✅ **Multi-Chain Support**: Deploy and use on multiple EVM networks
- ✅ **PIN Protection**: Optional PIN-based double authentication
- ✅ **Public/Private Stamps**: Choose visibility of your stamps
- ✅ **Export History**: Download transaction history as TXT or JSON

### Security Features
- 🔒 Privacy-first: Only hashes stored, never file content
- 🔒 Immutable records: Once stamped, cannot be altered
- 🔒 PIN-based protection: Additional security layer
- 🔒 Wallet-based ownership: Crypto wallet authentication

## 🛠️ Tech Stack

### Frontend
- **React.js** 18+ - UI framework
- **React Router** v6 - Client-side routing
- **Ethers.js** v6 - Blockchain interactions
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Ethers.js** - Blockchain interactions
- **Supabase** - PostgreSQL database

### Blockchain
- **Solidity** ^0.8.20 - Smart contracts
- **Hardhat** - Development framework
- **Polygon Amoy** (Testnet) - Primary network
- **Base Sepolia** (Testnet) - Supported
- **Ethereum Sepolia** (Testnet) - Supported
- **Arbitrum Sepolia** (Testnet) - Supported

### Deployment
- **Frontend**: Netlify
- **Backend**: Vercel (Serverless Functions)
- **Contracts**: Deployed per network

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │ (React + Ethers.js)
│   (Netlify) │
└──────┬──────┘
       │ HTTP/REST
       ↓
┌─────────────┐
│   Backend   │ (Express API)
│   (Vercel)  │
└──────┬──────┘
       │
       ├──→ Supabase (PostgreSQL)
       │    └── Stores stamp metadata
       │
       └──→ Blockchain (EVM Networks)
            └── Stores file hashes
```

### Data Flow

1. User uploads file → Frontend generates hash
2. Frontend → Backend API: Submit hash + metadata
3. Backend → Blockchain: Store hash on-chain
4. Backend → Supabase: Store metadata (optional)
5. Transaction receipt → User

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask browser extension
- Supabase account (free tier)
- Testnet tokens (for transactions)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mjibreel/blockchan.git
cd blockchan
```

2. **Install dependencies**

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

3. **Set up Supabase**

Create a new project at [supabase.com](https://supabase.com) and run:

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

4. **Configure environment variables**

See [Configuration](#configuration) section below.

5. **Deploy smart contract**

```bash
cd contracts
npm run deploy:amoy  # Or deploy:base-sepolia, etc.
```

6. **Start development servers**

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

Visit `http://localhost:3000`

## ⚙️ Configuration

### Backend Environment Variables (`backend/.env`)

```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://rpc-amoy.polygon.technology
CHAIN_ID=80002
CONTRACT_ADDRESS=0x...
```

### Frontend Environment Variables (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CHAIN_ID=80002
REACT_APP_POLYGONSCAN_URL=https://amoy.polygonscan.com
REACT_APP_CONTRACT_ADDRESS=0x...

# Multi-chain (optional)
REACT_APP_CONTRACT_ADDRESS_POLYGON=0x...
REACT_APP_CONTRACT_ADDRESS_BASE=0x...
REACT_APP_CONTRACT_ADDRESS_ETHEREUM=0x...
REACT_APP_CONTRACT_ADDRESS_ARBITRUM=0x...
```

### Contracts Environment Variables (`contracts/.env`)

```env
RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_wallet_private_key
```

## 📦 Deployment

### Current Live Deployments

- **Frontend**: https://mjibreel-blockchan.netlify.app/
- **Backend**: https://vercel.com/mohamed-jibrils-projects/blockchan

### Frontend (Netlify)

1. Connect GitHub repository to Netlify
2. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `build`
3. Add environment variables in Netlify dashboard:
   ```env
   REACT_APP_API_URL=https://your-vercel-backend-url.vercel.app
   REACT_APP_CHAIN_ID=80002
   REACT_APP_POLYGONSCAN_URL=https://amoy.polygonscan.com
   REACT_APP_CONTRACT_ADDRESS=0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA
   ```
4. Deploy automatically on push to `main`

⚠️ **Important**: Replace `REACT_APP_API_URL` with your actual Vercel backend URL!

### Backend Deployment Options

The backend can be deployed to multiple platforms. Choose based on your needs:

#### Option 1: Vercel (Serverless Functions) ⚡
- ✅ Free tier available
- ✅ Easy GitHub integration
- ✅ Auto-deploy on push
- ⚠️ Cold starts (slower first request)
- ⚠️ 10s timeout on free tier

**Setup:**
1. Connect GitHub repository to Vercel
2. Root directory: `backend`
3. Framework preset: Other
4. Build command: (none needed)
5. Output directory: (none)
6. Add environment variables in Vercel dashboard
7. Deploy automatically on push to `main`

#### Option 2: Render (Recommended for Backend) 🚀
- ✅ Always-on free tier
- ✅ No cold starts
- ✅ Better for long-running operations
- ✅ Supports databases

**Setup:**
1. Push code to GitHub
2. Connect repository in Render dashboard
3. Create new "Web Service"
4. Configure:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
5. Add environment variables
6. Deploy!

**Or use the Blueprint:** Upload `render.yaml` in Render dashboard for automatic setup.

#### Option 3: Railway 🚂
- ✅ Simple setup
- ✅ Free tier (with credit card)
- ✅ Good for beginners

**Setup:**
1. Connect GitHub to Railway
2. Create new project from repo
3. Select `backend` folder
4. Add environment variables
5. Deploy!

#### Option 4: Fly.io (Containers) 🪁
- ✅ Container-based
- ✅ Global edge deployment
- ✅ Free tier available

**Setup:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run: `cd backend && fly launch`
3. Add environment variables
4. Deploy: `fly deploy`

### Smart Contracts

```bash
cd contracts

# Deploy to Polygon Amoy
npm run deploy:amoy

# Deploy to Base Sepolia
npm run deploy:base-sepolia

# Deploy to Ethereum Sepolia
npm run deploy:ethereum-sepolia

# Deploy to Arbitrum Sepolia
npm run deploy:arbitrum-sepolia
```

After deployment, copy contract addresses to frontend `.env` file.

## 📚 API Documentation

### Base URL
- Local: `http://localhost:3001`
- Production: Your Vercel backend URL

### Endpoints

#### POST `/api/stamp`
Stamp a file hash on the blockchain.

**Request:**
```javascript
FormData {
  file: File,
  pin?: string,  // Optional PIN
  isPublic?: boolean  // Default: true
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x...",
  "blockNumber": 12345678,
  "fileHash": "0x...",
  "contractAddress": "0x..."
}
```

#### POST `/api/verify`
Verify if a file hash exists on the blockchain.

**Request:**
```javascript
FormData {
  file: File,
  pin?: string  // Optional PIN
}
```

**Response:**
```json
{
  "exists": true,
  "owner": "0x...",
  "timestamp": 1234567890,
  "isPublic": true,
  "txHash": "0x...",
  "blockNumber": 12345678
}
```

#### GET `/api/stamps/:address`
Get all stamps for a wallet address (from Supabase).

**Response:**
```json
{
  "address": "0x...",
  "count": 5,
  "stamps": [...]
}
```

#### GET `/api/history/:address`
Get transaction history for a wallet address (from blockchain).

**Response:**
```json
{
  "address": "0x...",
  "count": 5,
  "transactions": [
    {
      "txHash": "0x...",
      "fileHashHex": "0x...",
      "owner": "0x...",
      "timestamp": 1234567890000,
      "date": "2024-01-01T00:00:00.000Z",
      "isPublic": true,
      "blockNumber": 12345678,
      "gasUsed": "123456",
      "status": "success"
    }
  ]
}
```

#### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Qubic File Stamp API is running"
}
```

## 🔷 Smart Contracts

### Contract: `FileStamp.sol`

**Location:** `contracts/contracts/FileStamp.sol`

**Functions:**

- `stampFile(bytes32 fileHash, bool isPublic)` - Store a file hash on-chain
- `verifyFile(bytes32 fileHash)` - Verify if a file hash exists
- `getStampInfo(bytes32 fileHash)` - Get complete stamp information
- `fileExists(bytes32 fileHash)` - Simple boolean check

**Events:**

- `FileStamped(bytes32 indexed fileHash, address indexed owner, uint256 timestamp, bool isPublic)`

**Security:**
- Prevents duplicate stamps (same hash can only be stamped once)
- Records timestamp and owner address
- Supports public/private visibility

## 🌐 Multi-Chain Support

The application supports multiple EVM-compatible networks:

### Supported Networks

1. **Polygon Amoy** (Testnet)
   - Chain ID: 80002
   - Faucet: https://faucet.polygon.technology/
   - Status: ✅ Deployed

2. **Base Sepolia** (Testnet)
   - Chain ID: 84532
   - Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - Status: ⚠️ Contract deployment required

3. **Ethereum Sepolia** (Testnet)
   - Chain ID: 11155111
   - Faucet: https://www.alchemy.com/faucets/ethereum-sepolia
   - Status: ⚠️ Contract deployment required

4. **Arbitrum Sepolia** (Testnet)
   - Chain ID: 421614
   - Faucet: https://faucet.quicknode.com/arbitrum/sepolia
   - Status: ⚠️ Contract deployment required

### Switching Networks

Users can switch networks using the chain selector in the navbar (🌐 icon). The application will:
1. Prompt MetaMask to switch networks
2. Update contract addresses dynamically
3. Reload with new network settings

### Adding New Networks

1. Add network config to `frontend/src/config/networks.js`
2. Add network to Hardhat config (`contracts/hardhat.config.js`)
3. Deploy contract to new network
4. Add contract address to frontend `.env`
5. Update backend if needed

## 📖 Usage Guide

### Stamping a File

1. Connect your MetaMask wallet
2. Navigate to "Stamp" page
3. Select a file
4. (Optional) Enter a PIN
5. Choose public/private visibility
6. Click "Stamp File on Blockchain"
7. Approve transaction in MetaMask
8. Wait for confirmation

### Verifying a File

1. Navigate to "Verify" page
2. Upload the file you want to verify
3. (If used) Enter the same PIN
4. Click "Verify File"
5. View verification results

### Viewing History

1. Connect your wallet
2. Navigate to "History" page
3. View all your transactions
4. Search by hash, address, or date
5. Download as TXT or JSON

## 🔐 Security Considerations

### Private Keys
- ⚠️ **NEVER** commit private keys to Git
- Use environment variables only
- Use separate keys for testnet/mainnet
- Consider using hardware wallets for mainnet

### PIN Security
- PINs are combined with file hash before hashing
- Different PINs create different hashes for same file
- PINs are NOT stored anywhere
- User must remember their PIN to verify

### Smart Contract Security
- Contract prevents duplicate stamps
- Timestamps are set by blockchain (immutable)
- Ownership cannot be transferred
- Public/private flag is set at creation

## 🐛 Troubleshooting

### Common Issues

**"Insufficient funds" error**
- Get testnet tokens from faucet
- Check wallet balance
- Ensure correct network is selected

**"Contract not deployed" message**
- Deploy contract to selected network
- Add contract address to `.env`
- Restart application

**Transaction timeout**
- Check RPC endpoint
- Increase gas limit if needed
- Try again later

**MetaMask connection issues**
- Refresh page
- Disconnect and reconnect wallet
- Clear browser cache
- Check MetaMask extension

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test on testnet before mainnet
- Update documentation for new features

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Live Site**: https://mjibreel-blockchan.netlify.app
- **GitHub**: https://github.com/mjibreel/blockchan
- **Polygon Amoy Explorer**: https://amoy.polygonscan.com

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for immutable file authentication**
