

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose'); // ⭐⭐⭐ IMPORT MONGOOSE DI SINI ⭐⭐⭐
const errorHandler = require('./middleware/errorHandler');

require('dotenv').config();

const app = express();

// **FIXED: Async initialization dengan urutan yang benar**
const initializeApp = async () => {
  try {
    console.log('🔗 Step 1: Connecting to database...');
    
    // 1. Connect to database FIRST
    const MONGODB_URI = process.env.MONGODB_URI;
    // ⭐⭐⭐ CONNECT TO DATABASE ⭐⭐⭐
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database: ppob');
    
    console.log('✅ Database connected!');
    console.log('📝 Step 2: Registering Mongoose models...');
    
    // 2. Load models AFTER database connection
    require('./models/Product');
    require('./models/Transaction');
    require('./models/Agent');
    
    console.log('✅ Models registered!');
    console.log('🔄 Step 3: Loading routes...');
    
    // 3. Load routes AFTER models
    const productsRouter = require('./routes/products');
    const categoriesRouter = require('./routes/categories');
    const agentsRouter = require('./routes/agents');
    const transactionsRouter = require('./routes/transactions');
    
    // Middleware Setup
    app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      message: {
        success: false,
        message: 'Too many requests, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    app.use('/api/', limiter);

    // CORS
    app.use(cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:5173',
          'https://your-frontend.onrender.com',
          process.env.FRONTEND_URL
        ].filter(Boolean);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Body Parser
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
      next();
    });

    // Routes
    app.use('/api/products', productsRouter);
    app.use('/api/categories', categoriesRouter);
    app.use('/api/agents', agentsRouter);
    app.use('/api/transactions', transactionsRouter);

    // Health Check
    app.get('/health', (req, res) => {
      const dbStatus = mongoose.connection.readyState;
      const statusMap = {
        0: 'Disconnected',
        1: 'Connected', 
        2: 'Connecting',
        3: 'Disconnecting'
      };

      res.status(200).json({ 
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())} seconds`,
        database: statusMap[dbStatus],
        environment: process.env.NODE_ENV || 'development',
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
        }
      });
    });

    // API Version
    app.get('/api/version', (req, res) => {
      res.json({
        success: true,
        name: 'Pulsa Bot API',
        version: '1.0.0',
        description: 'PPOB API for Telegram Bot'
      });
    });

    // Root route
    app.get('/', (req, res) => {
      res.json({ 
        success: true,
        message: '🚀 Pulsa Bot API Server is running!', 
        version: '1.0.0',
        database: 'connected',
        models: ['Product', 'Transaction', 'Agent'],
        endpoints: {
          products: '/api/products',
          categories: '/api/categories', 
          agents: '/api/agents',
          transactions: '/api/transactions',
          health: '/health',
          version: '/api/version'
        }
      });
    });

    // Error handling
    app.use(errorHandler);

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({ 
        success: false,
        message: '🔍 Endpoint not found',
        requestedUrl: req.originalUrl,
        availableEndpoints: [
          '/api/products',
          '/api/categories',
          '/api/agents',
          '/api/transactions',
          '/health',
          '/api/version'
        ]
      });
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🎉 SERVER STARTED SUCCESSFULLY!`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health: http://localhost:${PORT}/health`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`🗄️  Database: ✅ Connected`);
      console.log(`📦 Models: ✅ Registered (Product, Transaction, Agent)`);
      console.log(`🛣️  Routes: ✅ Loaded\n`);
    });

  } catch (error) {
    console.error('\n❌ FAILED TO START SERVER:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Product')) {
      console.error('\n💡 SOLUTION: Check model files exist in models/ folder');
      console.error('   - models/Product.js');
      console.error('   - models/Transaction.js'); 
      console.error('   - models/Agent.js');
    }
    
    process.exit(1);
  }
};

// Start the application
initializeApp();

module.exports = app;
