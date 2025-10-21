const DatabaseConfig = require('../config/database');

class StorageService {
    constructor() {
        const config = DatabaseConfig.getStorageConfig();
        this.storageType = config.type;
        console.log(`✅ Storage: ${this.storageType.toUpperCase()} - ${config.name}`);
        
        // PASTIKAN INI ADALAH INSTANCE, BUKAN CLASS
        const JsonStorage = require('./JsonStorage');
        this.storage = new JsonStorage();
    }
    
    // PRODUCT METHODS
    async saveProducts(products) {
        return await this.storage.saveProducts(products);
    }
    
    async getProducts() {
        return await this.storage.getProducts();
    }
    
    async getActiveProducts() {
        const allProducts = await this.getProducts();
        return allProducts.filter(product => product.status === 'active');
    }
    
    async getProductsByCategory(category) {
        const allProducts = await this.getProducts();
        return allProducts.filter(product => product.category === category);
    }
    
    async getActiveProductsByCategory(category) {
        const activeProducts = await this.getActiveProducts();
        return activeProducts.filter(product => product.category === category);
    }
    
    async findProduct(code) {
        const allProducts = await this.getProducts();
        return allProducts.find(product => product.code === code);
    }
    
    async findActiveProduct(code) {
        const activeProducts = await this.getActiveProducts();
        return activeProducts.find(product => product.code === code);
    }
    
    // TRANSACTION METHODS
    async saveTransaction(tx) {
        return await this.storage.saveTransaction(tx);
    }
    
    async getAgentTransactions(agentId, limit = 50) {
        return await this.storage.getAgentTransactions(agentId, limit);
    }
    async getAgent(agenId){
        return await this.storage.getAgent(agenId);
    }
    async createAgent(agenData){
        return await this.storage.createAgent(agenData);
    }
}

// ⚠️ EKSPOR INSTANCE, BUKAN CLASS
module.exports = new StorageService();