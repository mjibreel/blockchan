const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const { getTransactionHistory } = require('../utils/blockchain');

/**
 * GET /api/history/:address
 * Get transaction history for a specific wallet address
 */
router.get('/:address', async (req, res, next) => {
  // Set CORS headers for all responses
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    const { address } = req.params;
    const { fromBlock } = req.query;

    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    // Convert address to checksum format
    const checksumAddress = ethers.getAddress(address);
    
    const fromBlockNumber = fromBlock ? parseInt(fromBlock, 10) : 0;
    
    const transactions = await getTransactionHistory(checksumAddress, fromBlockNumber);

    res.json({
      address: checksumAddress,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    
    // Provide helpful error message (CORS headers already set above)
    if (error.message?.includes('CONTRACT_ADDRESS')) {
      return res.status(503).json({ 
        error: 'Backend configuration incomplete. Contract address not configured.' 
      });
    }
    
    if (error.message?.includes('RPC_URL')) {
      return res.status(503).json({ 
        error: 'Backend configuration incomplete. RPC URL not configured.' 
      });
    }
    
    next(error);
  }
});

module.exports = router;

