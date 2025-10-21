const Product = require('../models/Product');

class MongoStorage {
    constructor() {
        console.log('📦 MongoStorage initialized');
    }
    
    // ⚠️ PASTIKAN METHOD INI ADA
    async saveProducts(products) {
        try {
            console.log('💾 Saving products to MongoDB...');
            
            // Hapus produk lama
            await Product.deleteMany({});
            
            // Insert produk baru
            await Product.insertMany(products);
            
            console.log(`✅ ${products.length} products saved to MongoDB`);
            return { success: true, count: products.length };
        } catch (error) {
            console.error('❌ Error saving products to MongoDB:', error);
            throw error;
        }
    }
    
    // ⚠️ PASTIKAN METHOD INI ADA  
    async getProducts() {
        try {
            console.log('📥 Getting products from MongoDB...');
            const products = await Product.find({});
            console.log(`✅ ${products.length} products retrieved from MongoDB`);
            return products;
        } catch (error) {
            console.error('❌ Error getting products from MongoDB:', error);
            return [];
        }
    }
    
    // Method lainnya bisa ditambahkan nanti
    async saveTransaction(tx) {
        console.log('📦 Saving transaction to MongoDB');
        return { ...tx, id: 'TX_MONGO' };
    }
    
    async getAgentTransactions(agentId, limit = 50) {
        console.log('📦 Getting transactions from MongoDB');
        return [];
    }
    
    async createAgent(agentData) {
        console.log('📦 Creating agent in MongoDB');
        return 'AGT_MONGO';
    }
    
    async getAgent(agentId) {
        console.log('📦 Getting agent from MongoDB');
        return null;
    }
    
    async updateAgentBalance(agentId, amount) {
        console.log('📦 Updating agent balance in MongoDB');
        return { agentId, balance: 0 };
    }
}

module.exports = MongoStorage;