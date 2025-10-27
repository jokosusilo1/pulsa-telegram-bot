
const mongoose = require('mongoose');
const config = require('../config');

class DatabaseService {
    constructor() {
        this.isConnected = false;
    }

    async connect() {
        // Skip connection jika development mode
        if (config.environment !== 'production') {
            console.log('🔧 [DEV] Skipping MongoDB connection - using JSON Storage');
            return;
        }

        if (this.isConnected) {
            console.log('✅ MongoDB already connected');
            return;
        }

        try {
            console.log('🔄 Connecting to MongoDB...');
            
            await mongoose.connect(config.database.mongoURI, config.database.options);
            this.isConnected = true;
            
            console.log('✅ MongoDB connected successfully');
            
            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                console.log('⚠️ MongoDB disconnected');
                this.isConnected = false;
            });

        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            console.log('🔄 Falling back to JSON Storage for now...');
            this.isConnected = false;
        }
    }
}

module.exports = new DatabaseService();
