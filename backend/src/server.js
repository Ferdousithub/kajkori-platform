const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'KajKori Backend is running!'
  });
});

// Basic routes
app.get('/api/jobs', (req, res) => {
  res.json({ 
    success: true,
    message: 'Jobs API - Coming soon',
    jobs: []
  });
});

app.get('/api/users/profile', (req, res) => {
  res.json({ 
    success: true,
    message: 'User profile API - Coming soon'
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'KajKori API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      jobs: '/api/jobs',
      profile: '/api/users/profile'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KajKori Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});