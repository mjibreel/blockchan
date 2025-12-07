const express = require('express');
const multer = require('multer');
const router = express.Router();
const { generateFileHash } = require('../utils/hash');
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
 * POST /api/stamp
 * Upload a file, generate hash, and stamp it on blockchain
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  // Set CORS headers for all responses
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    // Validate file
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const { ownerAddress, isPublic = true, txHash, fileHash: providedHash } = req.body;

    if (!ownerAddress) {
      return res.status(400).json({ error: 'Owner address is required' });
    }

    if (!txHash) {
      return res.status(400).json({ error: 'Transaction hash is required' });
    }

    // Generate file hash (or use provided one)
    console.log(`📄 Processing file: ${file.originalname} (${file.size} bytes)`);
    const fileHash = providedHash || generateFileHash(file.buffer);

    console.log(`🔐 File hash: ${fileHash}`);

    // Verify the transaction on blockchain
    const blockchainResult = await verifyFileOnChain('0x' + fileHash);
    
    if (!blockchainResult.exists) {
      return res.status(400).json({ 
        error: 'Transaction not found on blockchain. Please wait for confirmation.' 
      });
    }

    // Check if file already exists in database (if Supabase is configured)
    if (supabase) {
      const { data: existingStamp } = await supabase
        .from('stamps')
        .select('*')
        .eq('file_hash', fileHash)
        .single();

      if (existingStamp) {
        return res.status(409).json({
          error: 'File already stamped',
          existingStamp: {
            fileHash,
            ownerAddress: existingStamp.owner_address,
            timestamp: existingStamp.timestamp,
            txId: existingStamp.tx_id,
          },
        });
      }

      // Save to database (transaction already on blockchain, signed by user)
      const { data: stampData, error: dbError } = await supabase
        .from('stamps')
        .insert({
          file_hash: fileHash,
          owner_address: blockchainResult.owner, // Use owner from blockchain, not from request
          file_name: file.originalname,
          file_size: file.size,
          timestamp: new Date(blockchainResult.timestamp).toISOString(),
          tx_id: txHash,
          is_public: blockchainResult.isPublic,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Transaction is already on blockchain, but DB save failed
        // Return success with warning
        return res.status(201).json({
          success: true,
          warning: 'File stamped on blockchain but database save failed',
          fileHash,
          txHash: txHash,
          ownerAddress: blockchainResult.owner,
          timestamp: new Date(blockchainResult.timestamp).toISOString(),
        });
      }
    } else {
      console.log('⚠️  Supabase not configured - skipping database save');
    }

    // Success response
    res.status(201).json({
      success: true,
      fileHash,
      ownerAddress: blockchainResult.owner,
      timestamp: new Date(blockchainResult.timestamp).toISOString(),
      txHash: txHash,
      isPublic: blockchainResult.isPublic,
      fileName: file.originalname,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Error in stamp route:', error);
    next(error);
  }
});

module.exports = router;

