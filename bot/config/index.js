module.exports = {
    environment: process.env.NODE_ENV || 'development',
    
    // Database configuration
    database: {
        mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pulsa-bot',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        }
    },
    
    // Bot configuration
    bot: {
        token: process.env.BOT_TOKEN || 'your-bot-token-here'
    },
    
    // Feature flags
    features: {
        useDatabase: process.env.NODE_ENV === 'production',
        enableLogging: true
    }
};

