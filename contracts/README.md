# FileStamp Smart Contract

Smart contract for Qubic File Stamp - stores file hashes on Polygon Amoy testnet.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
```

3. Compile contract:
```bash
npm run compile
```

4. Deploy to Amoy:
```bash
npm run deploy:amoy
```

## Contract Functions

- `stampFile(bytes32 fileHash, bool isPublic)` - Store a file hash
- `verifyFile(bytes32 fileHash)` - Verify if a file hash exists
- `getStampInfo(bytes32 fileHash)` - Get complete stamp information
- `fileExists(bytes32 fileHash)` - Simple boolean check

## Events

- `FileStamped(bytes32 indexed fileHash, address indexed owner, uint256 timestamp, bool isPublic)`

