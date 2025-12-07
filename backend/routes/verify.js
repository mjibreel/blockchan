const express = require('express');
const multer = require('multer');
const router = express.Router();
const { generateFileHash, generateFileHashWithPin } = require('../utils/hash');
const { verifyFileOnChain } = require('../utils/blockchain');
const supabase = require('../utils/supabase');

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

/**
 * POST /api/verify
 * Verify if a file was previously stamped
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const { pin, fileHash: providedHash } = req.body;

    // Generate file hash (with PIN if provided)
    console.log(`🔍 Verifying file: ${file.originalname}`);
    let fileHash;
    if (providedHash) {
      // Use provided hash (already computed with PIN in frontend)
      fileHash = providedHash;
    } else if (pin) {
      // Generate hash with PIN
      fileHash = generateFileHashWithPin(file.buffer, pin);
    } else {
      // Generate normal file hash
      fileHash = generateFileHash(file.buffer);
    }

    // Check blockchain
    const blockchainResult = await verifyFileOnChain('0x' + fileHash);

    if (!blockchainResult.exists) {
      return res.json({
        exists: false,
        message: 'File not found on blockchain',
        fileHash,
      });
    }

    // Get additional info from database if available
    let dbStamp = null;
    if (supabase) {
      const { data } = await supabase
        .from('stamps')
        .select('*')
        .eq('file_hash', fileHash)
        .single();
      dbStamp = data;
    }

    // Format response
    const response = {
      exists: true,
      fileHash,
      ownerAddress: blockchainResult.owner,
      timestamp: new Date(blockchainResult.timestamp).toISOString(),
      isPublic: blockchainResult.isPublic,
      fileName: dbStamp?.file_name || file.originalname,
      txId: dbStamp?.tx_id || null,
    };

    res.json(response);
  } catch (error) {
    console.error('Error in verify route:', error);
    next(error);
  }
});

module.exports = router;

