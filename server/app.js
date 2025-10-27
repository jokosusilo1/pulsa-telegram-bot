const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');
const { simpleAuth } = require('./middleware/simpleAuth');
const operator = require('./routes/operators');

require('dotenv').config();

const app = express();


// **FIXED: Konfigurasi Mongoose dengan error handling yang lebih baik**
const initializeApp = async () => {
  try {
    console.log('🔗 Step 1: Connecting to database...');
    
    // 1. Validasi connection string
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB connection string. Must start with mongodb:// or mongodb+srv://');
    }

    console.log('📝 Connection string format:', MONGODB_URI.substring(0, 50) + '...');

    // 2. Connect to database dengan options yang tepat
    await mongoose.connect(MONGODB_URI, {
      // ⭐⭐⭐ FIXED: Tambahkan options untuk versi Mongoose terbaru ⭐⭐⭐
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
      bufferCommands: false, // disable buffering
      maxPoolSize: 10, // maximum pool size
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database:', mongoose.connection.db?.databaseName || 'ppob');
    console.log('🏠 Host:', mongoose.connection.host);

    // 3. Event listeners untuk koneksi database
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // 4. Load models AFTER successful database connection
    console.log('📝 Step 2: Registering Mongoose models...');
    
    try {
      require('./models/Product');
      require('./models/Transaction');
      require('./models/Agent');
      console.log('✅ Models registered successfully!');
    } catch (modelError) {
      console.error('❌ Error loading models:', modelError.message);
      throw modelError;
    }

    console.log('🔄 Step 3: Setting up middleware and routes...');
    
    // 5. Setup middleware
    setupMiddleware();
    
    // 6. Setup routes
    setupRoutes();

    // 7. Start server
    startServer();

  } catch (error) {
    console.error('\n❌ FAILED TO START SERVER:');
    console.error('Error:', error.message);
    
    // Detailed error information
    if (error.name === 'MongoServerError') {
      console.error('💡 MongoDB Error Code:', error.code);
      console.error('💡 Check your database credentials and IP whitelist');
    } else if (error.message.includes('MONGODB_URI')) {
      console.error('💡 SOLUTION: Check your .env file has MONGODB_URI defined');
    } else if (error.message.includes('models')) {
      console.error('\n💡 SOLUTION: Check model files exist in models/ folder');
      console.error('   - models/Product.js');
      console.error('   - models/Transaction.js'); 
      console.error('   - models/Agent.js');
    } else if (error.message.includes('Invalid scheme')) {
      console.error('💡 SOLUTION: Connection string must start with mongodb:// or mongodb+srv://');
      console.error('   Current MONGODB_URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'undefined');
    }
    
    process.exit(1);
  }
};

// **FIXED: Pisahkan setup middleware ke fungsi terpisah**
const setupMiddleware = () => {
  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api/', limiter);

  // CORS Configuration
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
};

// **FIXED: Pisahkan setup routes ke fungsi terpisah**
const setupRoutes = () => {
  app.use('/api', simpleAuth);
  // Load routes
  const productsRouter = require('./routes/products');
  const categoriesRouter = require('./routes/categories');
  const agentsRouter = require('./routes/agents');
  const transactionsRouter = require('./routes/transactions');
  const operatorRouter = require('./routes/operators');

  // Register routes
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/agents', agentsRouter);
  app.use('/api/transactions', transactionsRouter);
  app.use('/ap/operators', operatorRouter); 

  // Health Check - Enhanced
  app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
      0: 'Disconnected',
      1: 'Connected', 
      2: 'Connecting',
      3: 'Disconnecting'
    };

    res.status(dbStatus === 1 ? 200 : 503).json({ 
      success: dbStatus === 1,
      status: dbStatus === 1 ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())} seconds`,
      database: {
        status: statusMap[dbStatus],
        readyState: dbStatus,
        name: mongoose.connection.db?.databaseName || 'unknown',
        host: mongoose.connection.host || 'unknown'
      },
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
      description: 'PPOB API for Telegram Bot',
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        name: mongoose.connection.db?.databaseName || 'unknown'
      }
    });
  });

  // Root route
  app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    
    res.json({ 
      success: true,
      message: '🚀 Pulsa Bot API Server is running!', 
      version: '1.0.0',
      database: dbStatus === 1 ? 'connected' : 'disconnected',
      models: ['Product', 'Transaction', 'Agent','Operator'],
      endpoints: {
        products: '/api/products',
        categories: '/api/categories', 
        agents: '/api/agents',
        transactions: '/api/transactions',
        operators: '/api/operators',
        health: '/health',
        version: '/api/version'
      },
      timestamp: new Date().toISOString()
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
        '/api/operators',
        '/health',
        '/api/version'
      ]
    });
  });
};

// **FIXED: Pisahkan start server ke fungsi terpisah**
const startServer = () => {
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🎉 SERVER STARTED SUCCESSFULLY!`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📈 Health: http://localhost:${PORT}/health`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`🗄️  Database: ✅ Connected (${mongoose.connection.host})`);
    console.log(`📦 Models: ✅ Registered (Product, Transaction, Agent)`);
    console.log(`🛣️  Routes: ✅ Loaded\n`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      mongoose.connection.close();
      console.log('Process terminated');
    });
  });
};

// Start the application
initializeApp();

module.exports = app;