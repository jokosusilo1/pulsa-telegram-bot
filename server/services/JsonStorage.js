const fs = require('fs');
const path = require('path');

class JsonStorage {
    constructor() {
        this.dataDir = './data';
        this.ensureDir();
        console.log('📄 JsonStorage initialized');
    }
    
    ensureDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }
    
    getFilePath(filename) {
        return path.join(this.dataDir, `${filename}.json`);
    }
    
    readFile(filename) {
        try {
            const filePath = this.getFilePath(filename);
            if (fs.existsSync(filePath)) {
                return JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
        } catch (error) {
            console.log(`Creating new ${filename} file...`);
        }
        return [];
    }
    
    writeFile(filename, data) {
        const filePath = this.getFilePath(filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
    
    // ✅ METHOD YANG DIPERLUKAN OLEH STORAGESERVICE
    async saveProducts(products) {
        console.log(`💾 Saving ${products.length} products to JSON`);
        this.writeFile('products', products);
        return { success: true, count: products.length };
    }
    
    async getProducts() {
        const products = this.readFile('products');
        console.log(`📥 Retrieved ${products.length} products from JSON`);
        return products;
    }
    
    async saveTransaction(tx) {
        const transactions = this.readFile('transactions');
        const transaction = {
            id: 'TX' + Date.now(),
            ...tx,
            timestamp: new Date().toISOString()
        };
        
        transactions.unshift(transaction);
        this.writeFile('transactions', transactions);
        return transaction;
    }
    
    async getAgentTransactions(agentId, limit = 50) {
        const transactions = this.readFile('transactions');
        return transactions
            .filter(tx => tx.agentId === agentId)
            .slice(0, limit);
    }
    
    async createAgent(agentData) {
        const agents = this.readFile('agents');
        const agentId = 'AGT' + Date.now();
        
        agents[agentId] = {
            agentId,
            ...agentData,
            balance: 0,
            createdAt: new Date().toISOString()
        };
        
        this.writeFile('agents', agents);
        return agentId;
    }
    
    async getAgent(agentId) {
        const agents = this.readFile('agents');
        return agents[agentId];
    }
    
    async updateAgentBalance(agentId, amount) {
        const agents = this.readFile('agents');
        
        if (!agents[agentId]) {
            agents[agentId] = {
                agentId,
                balance: 0,
                createdAt: new Date().toISOString()
            };
        }
        
        agents[agentId].balance += amount;
        this.writeFile('agents', agents);
        return agents[agentId];
    }
}

// ⚠️ EKSPOR CLASS, BUKAN INSTANCE
module.exports = JsonStorage;