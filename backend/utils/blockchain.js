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

module.exports = {
  getProvider,
  getContract,
  getContractWithSigner,
  stampFileOnChain,
  verifyFileOnChain,
};

