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
  // Use environment variable or fallback to Polygon Amoy public RPC
  const rpcUrl = process.env.RPC_URL || 'https://rpc-amoy.polygon.technology';
  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Get contract instance
 */
function getContract() {
  // Use environment variable or fallback to deployed Polygon Amoy contract
  const contractAddress = process.env.CONTRACT_ADDRESS || '0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA';
  
  if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS not configured and no fallback available');
  }
  
  const provider = getProvider();
  return new ethers.Contract(
    contractAddress,
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
  // Use environment variable or fallback to deployed Polygon Amoy contract
  const contractAddress = process.env.CONTRACT_ADDRESS || '0xf8D623Dbfa1Dd1A3c904A69323df00773827C2DA';
  
  const provider = getProvider();
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return new ethers.Contract(
    contractAddress,
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
 * @param {number} fromBlock - Starting block number (optional, defaults to reasonable recent block)
 * @returns {Promise<Array>} - Array of transaction history objects
 */
async function getTransactionHistory(address, fromBlock = null) {
  try {
    const contract = getContract();
    const provider = getProvider();
    
    // If fromBlock not specified, use a reasonable starting point (last ~30 days of blocks)
    // Polygon Amoy produces ~2 blocks/second, so ~30 days = 5,184,000 seconds = ~2,592,000 blocks
    // Use last 3,000,000 blocks as a safe range (about 35 days)
    let startBlock = fromBlock;
    if (startBlock === null || startBlock === 0) {
      try {
        const currentBlock = await provider.getBlockNumber();
        // Go back 3,000,000 blocks (about 35 days worth)
        startBlock = Math.max(0, currentBlock - 3000000);
        console.log(`Using starting block: ${startBlock} (current: ${currentBlock})`);
      } catch (blockError) {
        console.warn('Could not get current block, using block 0:', blockError.message);
        startBlock = 0;
      }
    }
    
    // Filter by owner address (indexed parameter)
    const filter = contract.filters.FileStamped(null, address);
    
    console.log(`Querying events for address ${address} from block ${startBlock} to latest...`);
    
    // Query events with timeout handling
    const events = await Promise.race([
      contract.queryFilter(filter, startBlock, 'latest'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout: Request took too long')), 30000) // 30 second timeout
      )
    ]);
    
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
    
    console.log(`Found ${transactions.length} transactions for address ${address}`);
    return transactions;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    
    // If timeout or RPC error, try a smaller block range
    if (error.message && (error.message.includes('timeout') || error.message.includes('timed out') || error.code === -32002)) {
      console.log('Timeout detected, trying smaller block range...');
      
      try {
        const provider = getProvider();
        const currentBlock = await provider.getBlockNumber();
        // Try last 100,000 blocks (about 1 day)
        const recentBlock = Math.max(0, currentBlock - 100000);
        console.log(`Retrying with smaller range: ${recentBlock} to ${currentBlock}`);
        
        const contract = getContract();
        const filter = contract.filters.FileStamped(null, address);
        const events = await contract.queryFilter(filter, recentBlock, 'latest');
        
        // Process events (same as before)
        const transactions = await Promise.all(
          events.map(async (event) => {
            const receipt = await provider.getTransactionReceipt(event.transactionHash);
            
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
              timestamp: Number(event.args.timestamp) * 1000,
              date: new Date(Number(event.args.timestamp) * 1000).toISOString(),
              isPublic: event.args.isPublic,
              blockNumber: event.blockNumber,
              blockHash: event.blockHash,
              gasUsed: receipt.gasUsed.toString(),
              status: receipt.status === 1 ? 'success' : 'failed',
            };
          })
        );
        
        transactions.sort((a, b) => b.timestamp - a.timestamp);
        console.log(`Found ${transactions.length} recent transactions (last ~100k blocks)`);
        return transactions;
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
        throw new Error('Unable to fetch transaction history. The blockchain query is taking too long. Please try again later.');
      }
    }
    
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

