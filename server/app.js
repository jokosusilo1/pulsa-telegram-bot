const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
// Pastikan path benar
const productsRouter = require('./routes/product');
 
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'https://your-frontend.onrender.com'],
  credentials: true
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', require('./routes/product'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/agents', require('./routes/agent'));
app.use('/api/transactions', require('./routes/transactions'));

// Health Check Route
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Pulsa Bot API Server', 
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      agents: '/api/agents',
      transactions: '/api/transactions',
      health: '/health'
    },
    documentation: 'https://github.com/yourusername/pulsa-telegram-bot'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;