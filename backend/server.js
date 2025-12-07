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
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
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
