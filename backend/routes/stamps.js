const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');

/**
 * GET /api/stamps/:address
 * Get all stamps for a specific wallet address
 */
router.get('/:address', async (req, res, next) => {
  try {
    const { address } = req.params;

    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    const { data: stamps, error } = await supabase
      .from('stamps')
      .select('*')
      .eq('owner_address', address.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch stamps' });
    }

    res.json({
      address,
      count: stamps?.length || 0,
      stamps: stamps || [],
    });
  } catch (error) {
    console.error('Error in stamps route:', error);
    next(error);
  }
});

module.exports = router;

