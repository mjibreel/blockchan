const express = require('express');
const cors = require('cors');
require('dotenv').config();

const stampRoutes = require('./routes/stamp');
const verifyRoutes = require('./routes/verify');
const stampsRoutes = require('./routes/stamps');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/stamp', stampRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/stamps', stampsRoutes);
app.use('/api/history', historyRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Qubic File Stamp API',
    endpoints: {
      health: '/health',
      stamp: '/api/stamp',
      verify: '/api/verify',
      stamps: '/api/stamps',
      history: '/api/history/:address'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Qubic File Stamp API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Export for Vercel serverless functions
module.exports = app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1' && require.main === module) {
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});
}
