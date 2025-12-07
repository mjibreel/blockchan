const express = require('express');
const cors = require('cors');
require('dotenv').config();

const stampRoutes = require('./routes/stamp');
const verifyRoutes = require('./routes/verify');
const stampsRoutes = require('./routes/stamps');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configuration (allow all origins for now)
// This works for both regular Express and Vercel serverless
app.use((req, res, next) => {
  // Always set CORS headers first
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests - MUST respond before Express processes
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Also use cors middleware as fallback
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Error handling middleware - MUST set CORS headers before sending error
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Set CORS headers on error responses too
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
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
