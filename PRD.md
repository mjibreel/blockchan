# 📋 Product Requirements Document (PRD)
## Qubic File Stamp - Hackathon MVP

---

## 🎯 Product Vision

**Qubic File Stamp** is a m-based file authentication system that provides immutable proof of file ownership and authenticity. Users can stamp files on-chain (storing only hashes for privacy) and verify authenticity anytime, anywhere.

---

## 🎯 Core Objectives

1. **Prove File Authenticity**: Users can prove a file existed at a specific time
2. **Immutable Records**: Once stamped, records cannot be altered or deleted
3. **Privacy-First**: Only file hashes stored on-chain, not actual files
4. **Public Verification**: Anyone can verify file authenticity
5. **Low Cost**: Use Polygon for minimal gas fees

---

## 👥 Target Users

### Primary Users
- **Content Creators**: Prove ownership of original work
- **Developers**: Timestamp code repositories
- **Students/Researchers**: Prove document creation dates
- **Legal Professionals**: Authenticate legal documents
- **Businesses**: Verify contract/document integrity

### Secondary Users
- **Verifiers**: Anyone who needs to check file authenticity
- **Organizations**: Teams needing bulk file stamping

---

## ✨ Core Features (MVP - Must Have)

### 1. File Upload & Stamping
- **Description**: User uploads a file, system generates hash and stores on blockchain
- **User Flow**:
  1. User connects wallet (MetaMask)
  2. User selects file (any type: PDF, image, document, code)
  3. System generates SHA-256 hash
  4. Smart contract stores: `hash + owner address + timestamp`
  5. User receives proof with transaction ID
- **Acceptance Criteria**:
  - Support all file types
  - Hash generation < 2 seconds for files up to 100MB
  - Transaction confirmation within 30 seconds
  - Display transaction ID and PolygonScan link

### 2. Public File Verification
- **Description**: Anyone can upload a file to verify if it was previously stamped
- **User Flow**:
  1. User uploads file (no wallet needed)
  2. System generates hash
  3. System queries smart contract
  4. Display result: Authentic ✅ or Not Found ❌
- **Acceptance Criteria**:
  - Works without wallet connection
  - Shows original stamp date if found
  - Shows owner address (if public)
  - Shows transaction ID

### 3. Download Proof as PDF/JSON
- **Description**: Users can download their stamp proof in multiple formats
- **User Flow**:
  1. After stamping, user clicks "Download Proof"
  2. Choose format: PDF or JSON
  3. File downloads with all stamp details
- **Acceptance Criteria**:
  - PDF includes: File hash, owner address, timestamp, transaction ID, PolygonScan link
  - JSON includes: All metadata in structured format
  - Both formats are shareable/verifiable

### 4. Public/Private Stamps
- **Description**: Users can choose if their stamp is publicly verifiable or private
- **User Flow**:
  1. During upload, user selects "Public" or "Private"
  2. Public: Anyone can verify
  3. Private: Only owner can verify (requires wallet)
- **Acceptance Criteria**:
  - Default: Public (for hackathon simplicity)
  - Private stamps require wallet connection to verify
  - Smart contract stores visibility flag

---

## 🎨 User Interface Requirements

### Pages Needed

#### 1. **Home/Landing Page**
- Hero section: "Prove Your File's Authenticity"
- Quick explanation (3 steps)
- "Get Started" button
- Features showcase

#### 2. **Stamp Page** (Main Feature)
- Wallet connection button
- File upload area (drag & drop)
- Public/Private toggle
- "Stamp File" button
- Loading state during transaction
- Success state with:
  - File hash
  - Owner address
  - Timestamp
  - Transaction ID (clickable → PolygonScan)
  - Download Proof button (PDF/JSON)

#### 3. **Verify Page**
- File upload area (no wallet needed)
- "Verify File" button
- Results display:
  - ✅ Authentic: Show all stamp details
  - ❌ Not Found: "This file was not stamped"

#### 4. **My Stamps Page** (Optional - Nice to Have)
- List of user's stamped files
- Filter/search
- Re-download proofs

---

## 🔧 Technical Requirements

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **Web3**: Ethers.js v6
- **File Handling**: FileReader API
- **State Management**: React Context or useState

### Backend
- **Runtime**: Node.js + Express
- **Database**: Supabase (PostgreSQL) ⭐ **RECOMMENDED**
  - Store: file metadata, user info, stamp history
  - Built-in REST API (can use directly from frontend if needed)
  - Free tier is generous for hackathon
  - Alternative: MongoDB Atlas (if preferred)
- **Hashing**: Node.js `crypto` module (SHA-256)
- **Blockchain**: Polygon Mumbai Testnet
- **API Endpoints**:
  - `POST /api/stamp` - Generate hash and return transaction data
  - `POST /api/verify` - Verify file hash
  - `GET /api/stamps/:address` - Get user's stamps (optional)

### Smart Contract
- **Language**: Solidity
- **Network**: Polygon Mumbai Testnet
- **Functions**:
  - `stampFile(bytes32 hash, bool isPublic)` - Store file hash
  - `verifyFile(bytes32 hash)` - Check if hash exists
  - `getStampInfo(bytes32 hash)` - Get stamp details
- **Events**: `FileStamped(hash, owner, timestamp, isPublic)`

### Blockchain Integration
- **Provider**: Alchemy or Infura (Polygon Mumbai RPC)
- **Wallet**: MetaMask integration
- **Gas Optimization**: Batch transactions if possible
- **Error Handling**: Network errors, insufficient funds, rejected transactions

---

## 📊 Data Models

### Smart Contract Storage
```solidity
struct Stamp {
    address owner;
    uint256 timestamp;
    bool isPublic;
    string txId;
}

mapping(bytes32 => Stamp) public stamps;
```

### Supabase/PostgreSQL Schema
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

### Alternative: MongoDB Schema
```javascript
{
  _id: ObjectId,
  fileHash: String (indexed),
  ownerAddress: String,
  fileName: String,
  fileSize: Number,
  timestamp: Date,
  txId: String,
  isPublic: Boolean,
  createdAt: Date
}
```

---

## 🚀 User Stories

### Story 1: Content Creator Stamps Original Work
**As a** content creator  
**I want to** stamp my original artwork  
**So that** I can prove I created it first

**Acceptance**: Upload image → Get proof → Download PDF → Share proof

### Story 2: Developer Verifies Code Integrity
**As a** developer  
**I want to** verify if a code file was tampered with  
**So that** I can ensure code authenticity

**Acceptance**: Upload code file → See "Authentic" or "Not Found"

### Story 3: Student Proves Document Date
**As a** student  
**I want to** stamp my assignment  
**So that** I can prove when I created it

**Acceptance**: Upload document → Get timestamp proof → Download JSON

---

## 🎯 Success Metrics (Hackathon)

- ✅ All core features working
- ✅ Smooth demo flow (upload → stamp → verify)
- ✅ Transaction visible on PolygonScan
- ✅ Proof download works
- ✅ Public/private stamps functional
- ✅ Clean, responsive UI

---

## 🚫 Out of Scope (For MVP)

- ❌ File storage (IPFS integration)
- ❌ Batch uploads (can add if time)
- ❌ User accounts/authentication
- ❌ Payment/subscription
- ❌ Mobile app
- ❌ Multi-chain support
- ❌ File versioning

---

## 🔒 Security & Privacy

- ✅ Only hashes stored on-chain (not files)
- ✅ Private stamps require wallet to verify
- ✅ No file content stored in database
- ✅ Wallet connection via MetaMask (secure)
- ✅ Input validation on file uploads

---

## 📅 Timeline (48 Hours)

### Day 1 (24 hours)
- [ ] Smart contract development & deployment
- [ ] Backend API setup (hashing, blockchain integration)
- [ ] Basic frontend (upload, stamp, verify pages)

### Day 2 (24 hours)
- [ ] Public/private stamp feature
- [ ] Proof download (PDF/JSON)
- [ ] UI polish & responsive design
- [ ] Testing & bug fixes
- [ ] Demo preparation

---

## 🎤 Pitch Points

1. **Problem**: How do you prove a file is authentic and when it was created?
2. **Solution**: Blockchain timestamping with cryptographic hashing
3. **Why Blockchain**: Immutable, decentralized, no single point of failure
4. **Privacy**: Only hashes stored, not files
5. **Cost**: Polygon = near-zero gas fees
6. **Demo**: Show upload → stamp → verify → PolygonScan link

---

## 📝 Notes

- Focus on **working demo** over extra features
- **Polygon Mumbai Testnet** for hackathon (free, fast)
- Keep UI **simple and clean**
- **Test the full flow** before presentation
- Have **backup demo** ready (recorded video)

---

**Version**: 1.0  
**Last Updated**: Hackathon Start  
**Status**: Ready for Development

