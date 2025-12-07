const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABI (minimal - just the functions we need)
const CONTRACT_ABI = [
  "function stampFile(bytes32 fileHash, bool isPublic) external",
  "function verifyFile(bytes32 fileHash) external view returns (bool exists, address owner, uint256 timestamp, bool isPublic)",
  "function getStampInfo(bytes32 fileHash) external view returns (tuple(address owner, uint256 timestamp, bool isPublic) stamp)",
  "function fileExists(bytes32 fileHash) external view returns (bool)",
  "event FileStamped(bytes32 indexed fileHash, address indexed owner, uint256 timestamp, bool isPublic)"
];

/**
 * Get blockchain provider
 */
function getProvider() {
  if (!process.env.RPC_URL) {
    throw new Error('RPC_URL not configured');
  }
  return new ethers.JsonRpcProvider(process.env.RPC_URL);
}

/**
 * Get contract instance
 */
function getContract() {
  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS not configured');
  }
  const provider = getProvider();
  return new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );
}

/**
 * Get contract instance with signer (for transactions)
 */
function getContractWithSigner() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not configured');
  }
  const provider = getProvider();
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  );
}

/**
 * Stamp a file hash on the blockchain
 * @param {string} fileHash - Hex string hash (0x...)
 * @param {boolean} isPublic - Whether the stamp is public
 * @returns {Promise<Object>} - Transaction receipt
 */
async function stampFileOnChain(fileHash, isPublic) {
  try {
    const contract = getContractWithSigner();
    
    console.log(`📝 Stamping file hash: ${fileHash}`);
    console.log(`🔓 Public: ${isPublic}`);
    
    const tx = await contract.stampFile(fileHash, isPublic);
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
    
    return {
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error('Error stamping file on chain:', error);
    throw error;
  }
}

/**
 * Verify a file hash on the blockchain
 * @param {string} fileHash - Hex string hash (0x...)
 * @returns {Promise<Object>} - Verification result
 */
async function verifyFileOnChain(fileHash) {
  try {
    const contract = getContract();
    const result = await contract.verifyFile(fileHash);
    
    const [exists, owner, timestamp, isPublic] = result;
    
    return {
      exists,
      owner: exists ? owner : null,
      timestamp: exists ? Number(timestamp) * 1000 : null, // Convert to milliseconds
      isPublic: exists ? isPublic : null,
    };
  } catch (error) {
    console.error('Error verifying file on chain:', error);
    throw error;
  }
}

/**
 * Get transaction history for a specific address
 * @param {string} address - Wallet address to get history for
 * @param {number} fromBlock - Starting block number (optional, defaults to contract deployment or 0)
 * @returns {Promise<Array>} - Array of transaction history objects
 */
async function getTransactionHistory(address, fromBlock = 0) {
  try {
    const contract = getContract();
    const provider = getProvider();
    
    // Filter by owner address (indexed parameter)
    const filter = contract.filters.FileStamped(null, address);
    
    // Query events from contract deployment or specified block
    const events = await contract.queryFilter(filter, fromBlock, 'latest');
    
    // Fetch transaction receipts for more details
    const transactions = await Promise.all(
      events.map(async (event) => {
        const receipt = await provider.getTransactionReceipt(event.transactionHash);
        const block = await provider.getBlock(event.blockNumber);
        
        // Convert fileHash to hex string (bytes32 might be Uint8Array or hex string)
        let fileHashHex;
        if (typeof event.args.fileHash === 'string') {
          fileHashHex = event.args.fileHash;
        } else {
          fileHashHex = ethers.hexlify(event.args.fileHash);
        }
        
        return {
          txHash: event.transactionHash,
          fileHash: event.args.fileHash,
          fileHashHex: fileHashHex,
          owner: event.args.owner,
          timestamp: Number(event.args.timestamp) * 1000, // Convert to milliseconds
          date: new Date(Number(event.args.timestamp) * 1000).toISOString(),
          isPublic: event.args.isPublic,
          blockNumber: event.blockNumber,
          blockHash: event.blockHash,
          gasUsed: receipt.gasUsed.toString(),
          status: receipt.status === 1 ? 'success' : 'failed',
        };
      })
    );
    
    // Sort by timestamp (newest first)
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
}

module.exports = {
  getProvider,
  getContract,
  getContractWithSigner,
  stampFileOnChain,
  verifyFileOnChain,
  getTransactionHistory,
};

