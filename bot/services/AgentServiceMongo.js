// services/AgentServiceMongo.js - DIPERBAIKI
const { MongoClient } = require('mongodb');

// MongoDB connection setup
let client = null;
let db = null;
const collectionName = 'agents';

// Helper functions untuk MongoDB dengan error handling
async function connectDB() {
    if (db) return db;
    
    try {
        // ✅ PERBAIKAN: Validasi MONGODB_URI
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }

        // ✅ PERBAIKAN: Validasi format URI
        if (typeof mongoUri !== 'string' || mongoUri.trim() === '') {
            throw new Error('MONGODB_URI is not a valid string');
        }

        console.log('🔗 Attempting MongoDB connection...');
        
        client = new MongoClient(mongoUri, {
            serverSelectionTimeoutMS: 10000, // 10 second timeout
            connectTimeoutMS: 10000,
            maxPoolSize: 10,
        });

        await client.connect();
        
        const dbName = process.env.MONGODB_DB_NAME || 'pulsa_bot';
        db = client.db(dbName);
        
        // Test connection
        await db.command({ ping: 1 });
        console.log('✅ Connected to MongoDB successfully');
        return db;
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        
        // Close client jika ada error
        if (client) {
            try {
                await client.close();
            } catch (closeError) {
                console.error('Error closing MongoDB client:', closeError);
            }
            client = null;
            db = null;
        }
        
        throw error;
    }
}

async function getCollection() {
    try {
        const database = await connectDB();
        return database.collection(collectionName);
    } catch (error) {
        console.error('❌ Failed to get collection:', error.message);
        throw error;
    }
}

// ✅ PERBAIKAN: Safe database operations dengan fallback
async function safeDbOperation(operation, fallbackValue) {
    try {
        return await operation();
    } catch (error) {
        console.error('❌ Database operation failed:', error.message);
        
        // Jika koneksi terputus, reset connection
        if (error.name === 'MongoNotConnectedError' || error.message.includes('connection')) {
            client = null;
            db = null;
        }
        
        return fallbackValue;
    }
}

// Main functions dengan safe operations
async function checkAgentRegistration(telegramId) {
    return safeDbOperation(async () => {
        console.log(`🔍 [MongoDB] Checking registration for: ${telegramId}`);
        const collection = await getCollection();
        const agent = await collection.findOne({ 
            $or: [{ telegramId: telegramId }, { userId: telegramId }] 
        });
        const isRegistered = !!(agent && agent.isRegistered);
        console.log(`📊 [MongoDB] Registration status: ${isRegistered}`);
        return isRegistered;
    }, false);
}

async function getAgent(telegramId) {
    return safeDbOperation(async () => {
        console.log(`🔍 [MongoDB] Getting agent: ${telegramId}`);
        const collection = await getCollection();
        const agent = await collection.findOne({ 
            $or: [{ telegramId: telegramId }, { userId: telegramId }] 
        });
        
        if (agent) {
            console.log(`✅ [MongoDB] Agent found: ${agent.name}`);
        } else {
            console.log(`❌ [MongoDB] Agent not found: ${telegramId}`);
        }
        
        return agent;
    }, null);
}

async function createAgent(agentData) {
    return safeDbOperation(async () => {
        console.log('📝 [MongoDB] Creating agent:', agentData);
        const collection = await getCollection();
        const telegramId = agentData.telegramId;
        
        if (!telegramId) {
            throw new Error('Missing telegramId');
        }
        
        // Check duplicate
        const existingAgent = await collection.findOne({ 
            $or: [{ telegramId: telegramId }, { userId: telegramId }] 
        });
        
        if (existingAgent) {
            console.log(`⚠️ [MongoDB] Agent already exists: ${telegramId}`);
            throw new Error('Agent already exists');
        }
        
        // Create new agent
        const newAgent = {
            telegramId: telegramId,
            userId: telegramId,
            name: agentData.name,
            phone: agentData.phone,
            email: agentData.email,
            pin: agentData.pin,
            username: agentData.username,
            role: 'agent',
            balance: 0,
            isRegistered: true,
            isActive: true,
            registeredAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const result = await collection.insertOne(newAgent);
        console.log(`✅ [MongoDB] Agent created successfully: ${newAgent.name}`);
        return newAgent;
    }, null);
}

async function getAllAgents() {
    return safeDbOperation(async () => {
        const collection = await getCollection();
        const agents = await collection.find().toArray();
        console.log(`📊 [MongoDB] Loaded ${agents.length} agents`);
        return agents;
    }, []);
}

async function getAgentCount() {
    return safeDbOperation(async () => {
        const collection = await getCollection();
        const count = await collection.countDocuments();
        return count;
    }, 0);
}

async function debugData() {
    return safeDbOperation(async () => {
        const agents = await getAllAgents();
        console.log('🔍 [MongoDB] DEBUG DATA:');
        console.log(`📊 Total agents: ${agents.length}`);
        
        if (agents.length === 0) {
            console.log('📭 No agents found');
        } else {
            agents.forEach((agent, index) => {
                console.log(`👤 Agent ${index + 1}:`, {
                    telegramId: agent.telegramId,
                    name: agent.name,
                    phone: agent.phone,
                    email: agent.email,
                    isRegistered: agent.isRegistered,
                    balance: agent.balance
                });
            });
        }
        
        return agents;
    }, []);
}

async function clearAgents() {
    return safeDbOperation(async () => {
        const collection = await getCollection();
        await collection.deleteMany({});
        console.log('✅ [MongoDB] Cleared all agents');
    });
}

async function testFileOperations() {
    try {
        console.log('🧪 [MongoDB] Testing database operations...');
        
        // Test connection
        await connectDB();
        
        // Test basic query
        const count = await getAgentCount();
        console.log(`✅ [MongoDB] Database test passed, ${count} agents found`);
        return true;
        
    } catch (error) {
        console.error('❌ [MongoDB] Database test failed:', error.message);
        return false;
    }
}

// Export semua functions
module.exports = {
    checkAgentRegistration,
    getAgent,
    createAgent,
    getAllAgents,
    getAgentCount,
    debugData,
    clearAgents,
    testFileOperations
};