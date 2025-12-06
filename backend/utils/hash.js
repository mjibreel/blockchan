const crypto = require('crypto');
const fs = require('fs');

/**
 * Generate SHA-256 hash of a file buffer
 * @param {Buffer} fileBuffer - The file buffer to hash
 * @returns {string} - The hexadecimal hash string
 */
function generateFileHash(fileBuffer) {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * Generate SHA-256 hash of file + PIN (for double authentication)
 * @param {Buffer} fileBuffer - The file buffer to hash
 * @param {string} pin - User's PIN/password
 * @returns {string} - The hexadecimal hash string
 */
function generateFileHashWithPin(fileBuffer, pin) {
  const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  // Combine file hash with PIN and hash again
  return crypto.createHash('sha256').update(fileHash + pin).digest('hex');
}

/**
 * Generate SHA-256 hash from a file path
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - The hexadecimal hash string
 */
async function generateFileHashFromPath(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Convert hex hash to bytes32 format for smart contract
 * @param {string} hexHash - Hexadecimal hash string
 * @returns {string} - Bytes32 formatted hash (0x prefixed)
 */
function hexToBytes32(hexHash) {
  // Remove 0x prefix if present
  const cleanHash = hexHash.startsWith('0x') ? hexHash.slice(2) : hexHash;
  // Ensure it's exactly 64 characters (32 bytes)
  if (cleanHash.length !== 64) {
    throw new Error('Hash must be 64 characters (32 bytes)');
  }
  return '0x' + cleanHash;
}

module.exports = {
  generateFileHash,
  generateFileHashWithPin,
  generateFileHashFromPath,
  hexToBytes32,
};

