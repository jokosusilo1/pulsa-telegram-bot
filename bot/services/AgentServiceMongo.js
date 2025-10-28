// services/AgentServiceMongo.js - MATCH DENGAN JSON
const { MongoClient } = require('mongodb');

// MongoDB connection setup
let client = null;
let db = null;
const collectionName = 'agents';

// Helper functions untuk MongoDB
async function connectDB() {
    if (db) return db;
    
    try {
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        db = client.db(process.env.MONGODB_DB_NAME || 'pulsa_bot');
        console.log('✅ Connected to MongoDB');
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

async function getCollection() {
    const database = await connectDB();
    return database.collection(collectionName);
}

// Main functions - SAMA PERSIS DENGAN AgentServiceJSON
async function checkAgentRegistration(telegramId) {
    try {
        console.log(`🔍 [MongoDB] Checking registration for: ${telegramId}`);
        const collection = await getCollection();
        const agent = await collection.findOne({ 
            $or: [{ telegramId: telegramId }, { userId: telegramId }] 
        });
        const isRegistered = !!(agent && agent.isRegistered);
        console.log(`📊 [MongoDB] Registration status: ${isRegistered}`);
        return isRegistered;
    } catch (error) {
        console.error('❌ [MongoDB] Error checking registration:', error);
        return false;
    }
}

async function getAgent(telegramId) {
    try {
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
    } catch (error) {
        console.error('❌ [MongoDB] Error getting agent:', error);
        return null;
    }
}

async function createAgent(agentData) {
    try {
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
        
        // Create new agent - STRUKTUR SAMA dengan JSON
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
        
    } catch (error) {
        console.error('❌ [MongoDB] Error creating agent:', error);
        throw error;
    }
}

async function getAllAgents() {
    try {
        const collection = await getCollection();
        const agents = await collection.find().toArray();
        console.log(`📊 [MongoDB] Loaded ${agents.length} agents`);
        return agents;
    } catch (error) {
        console.error('❌ [MongoDB] Error getting all agents:', error);
        return [];
    }
}

async function getAgentCount() {
    try {
        const collection = await getCollection();
        const count = await collection.countDocuments();
        return count;
    } catch (error) {
        console.error('❌ [MongoDB] Error getting agent count:', error);
        return 0;
    }
}

async function debugData() {
    try {
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
    } catch (error) {
        console.error('❌ [MongoDB] Error debugging data:', error);
        return [];
    }
}

async function clearAgents() {
    try {
        const collection = await getCollection();
        await collection.deleteMany({});
        console.log('✅ [MongoDB] Cleared all agents');
    } catch (error) {
        console.error('❌ [MongoDB] Error clearing agents:', error);
        throw error;
    }
}

async function testFileOperations() {
    try {
        console.log('🧪 [MongoDB] Testing database operations...');
        const agents = await getAllAgents();
        await getCollection(); // Test connection
        console.log(`✅ [MongoDB] Database test passed, ${agents.length} agents found`);
        return true;
    } catch (error) {
        console.error('❌ [MongoDB] Database test failed:', error);
        return false;
    }
}

// Export semua functions - SAMA PERSIS dengan JSON
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