# Architecture Documentation

## System Overview

Qubic File Stamp is a decentralized file authentication system that combines blockchain technology with traditional web services to provide immutable proof of file ownership.

## Components

### 1. Frontend (React Application)

**Location:** `frontend/`

**Responsibilities:**
- User interface and interaction
- Wallet connection (MetaMask)
- File upload and hash generation
- Transaction signing and submission
- Display of results and history

**Key Files:**
- `src/App.js` - Main application component and routing
- `src/context/WalletContext.js` - Wallet connection state management
- `src/pages/Stamp.js` - File stamping interface
- `src/pages/Verify.js` - File verification interface
- `src/pages/History.js` - Transaction history display
- `src/components/Navbar.js` - Navigation and wallet controls
- `src/config/networks.js` - Multi-chain configuration

### 2. Backend (Express API)

**Location:** `backend/`

**Responsibilities:**
- Blockchain interaction via Ethers.js
- File hash generation and validation
- Transaction submission to blockchain
- Supabase database integration
- Transaction history queries

**Key Files:**
- `server.js` - Express server setup and routes
- `routes/stamp.js` - Stamping endpoint
- `routes/verify.js` - Verification endpoint
- `routes/history.js` - History endpoint
- `routes/stamps.js` - Supabase stamps endpoint
- `utils/blockchain.js` - Blockchain utilities
- `utils/supabase.js` - Database utilities

### 3. Smart Contracts

**Location:** `contracts/`

**Responsibilities:**
- On-chain storage of file hashes
- Ownership and timestamp tracking
- Immutable record keeping

**Key Files:**
- `contracts/FileStamp.sol` - Main smart contract
- `scripts/deploy.js` - Deployment script
- `hardhat.config.js` - Hardhat configuration

## Data Flow

### Stamping Flow

```
User → Frontend → Backend → Blockchain
  │       │          │           │
  │       │          │           └─> Store hash on-chain
  │       │          │
  │       │          └─> Store metadata in Supabase (optional)
  │       │
  │       └─> Display transaction receipt
  │
  └─> Show success/failure
```

### Verification Flow

```
User → Frontend → Backend → Blockchain
  │       │          │           │
  │       │          │           └─> Query hash
  │       │          │
  │       │          └─> Return verification result
  │       │
  │       └─> Display verification status
  │
  └─> Show verification details
```

## State Management

### Wallet State (WalletContext)

- `account` - Connected wallet address
- `provider` - Ethers.js provider instance
- `chainId` - Current network chain ID
- `selectedNetwork` - Currently selected network
- `isConnected` - Connection status
- `isCorrectNetwork` - Network validation

### Application State

- File upload state (local component state)
- Transaction status (loading, success, error)
- History data (fetched from API)
- Network selection (localStorage persistence)

## Security Architecture

### Frontend Security
- No private keys stored
- All transactions signed by MetaMask
- Input validation for file types
- XSS prevention via React

### Backend Security
- Private key stored in environment variables
- RPC endpoint security
- CORS configuration
- Input sanitization

### Smart Contract Security
- Prevents duplicate stamps
- Immutable timestamps
- Ownership verification
- Gas optimization

## Database Schema

### Supabase: `stamps` Table

```sql
CREATE TABLE stamps (
  id UUID PRIMARY KEY,
  file_hash VARCHAR(64) UNIQUE NOT NULL,
  owner_address VARCHAR(42) NOT NULL,
  file_name VARCHAR(255),
  file_size BIGINT,
  timestamp TIMESTAMP NOT NULL,
  tx_id VARCHAR(66) NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `idx_file_hash` - Fast hash lookups
- `idx_owner_address` - Fast owner queries

## Network Configuration

### Multi-Chain Support

Networks are configured in `frontend/src/config/networks.js`:

```javascript
{
  chainId: number,
  name: string,
  nativeCurrency: {...},
  rpcUrls: [...],
  blockExplorerUrls: [...],
  faucetUrl: string,
  contractAddress: string
}
```

### Network Switching

1. User selects network in UI
2. MetaMask switches network
3. Frontend updates contract address
4. Application reloads with new settings

## Deployment Architecture

### Production Setup

```
┌──────────────┐
│   GitHub     │
│  Repository  │
└──────┬───────┘
       │
       ├─────────────┬──────────────┐
       │             │              │
       ↓             ↓              ↓
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Netlify  │  │  Vercel  │  │ Blockchain│
│ Frontend │  │ Backend  │  │ Networks  │
└──────────┘  └──────────┘  └──────────┘
```

### CI/CD Flow

1. Push to `main` branch
2. GitHub webhook triggers deployment
3. Netlify builds frontend
4. Vercel deploys backend functions
5. Automatic deployment to production

## Performance Considerations

### Frontend Optimization
- React code splitting
- Lazy loading of routes
- Optimized bundle size
- Image optimization

### Backend Optimization
- Connection pooling for RPC
- Caching of contract instances
- Efficient database queries
- Rate limiting (future)

### Blockchain Optimization
- Gas-efficient smart contracts
- Batch queries for history
- Limited block range queries
- Timeout handling

## Future Enhancements

### Planned Features
- IPFS integration for file storage
- Batch file stamping
- File versioning support
- API rate limiting
- Analytics dashboard
- Mobile app support

### Technical Improvements
- GraphQL API
- WebSocket for real-time updates
- Enhanced error handling
- Comprehensive testing
- Performance monitoring

