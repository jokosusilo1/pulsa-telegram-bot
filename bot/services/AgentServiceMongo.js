// bot/services/AgentServiceMongo.js - PATH YANG BENAR
const path = require('path');

console.log('📁 Current working directory:', process.cwd());
console.log('📁 Current file location:', __dirname);

let Agent;
let modelPath;

// ✅ PATH YANG BENAR UNTUK bot/services/ ke server/models/
const possiblePaths = [
    // Dari bot/services/ ke server/models/ (naik 1 level ke root, lalu masuk server/models)
    '../server/models/Agent',
    // Absolute path
    path.join(process.cwd(), 'server', 'models', 'Agent'),
    // Dari bot/services directory
    path.join(__dirname, '..', '..', 'server', 'models', 'Agent')
];

console.log('🔍 Attempting to load Agent model from possible paths:');
for (const tryPath of possiblePaths) {
    try {
        console.log(`   Trying: ${tryPath}`);
        // Clear cache dulu
        delete require.cache[require.resolve(tryPath)];
        Agent = require(tryPath);
        modelPath = tryPath;
        console.log(`   ✅ SUCCESS: Agent model loaded from: ${tryPath}`);
        break;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
    }
}

if (!Agent) {
    console.error('💥 CRITICAL: Could not load Agent model from any path!');
    console.log('📋 Available paths tried:', possiblePaths);
    
    // Fallback untuk prevent crash
    class FallbackAgentService {
        static async createAgent(agentData) {
            throw new Error(`Agent model not found. Paths tried: ${possiblePaths.join(', ')}`);
        }
        static async findByTelegramIdOrPhone() { return null; }
        static async getAllAgents() { return []; }
        static async getAgentCount() { return 0; }
        static async checkAgentRegistration() { return false; }
        static async getAgent() { return null; }
        static async debugData() { return { error: 'Agent model not loaded' }; }
    }
    
    module.exports = FallbackAgentService;
    return;
}

console.log(`🎯 Agent model successfully loaded from: ${modelPath}`);

class AgentServiceMongo {
    static async createAgent(agentData) {
        try {
            console.log('🔄 AgentServiceMongo: Creating agent...');
            
            // ✅ HAPUS FIELD YANG TIDAK ADA DI SCHEMA
            const cleanAgentData = { ...agentData };
            delete cleanAgentData.username;
            delete cleanAgentData.registeredAt;

            console.log('🧹 Cleaned agent data:', cleanAgentData);

            // ✅ VALIDATE REQUIRED FIELDS
            const requiredFields = ['name', 'phone', 'email', 'pin', 'telegramId'];
            const missingFields = requiredFields.filter(field => !cleanAgentData[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // ✅ CREATE AND SAVE AGENT
            const agent = new Agent(cleanAgentData);
            const savedAgent = await agent.save();
            
            console.log('✅ AgentServiceMongo: Agent saved successfully with ID:', savedAgent._id);
            return savedAgent;
            
        } catch (error) {
            console.error('❌ AgentServiceMongo.createAgent Error:');
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            
            if (error.name === 'ValidationError') {
                console.error('📋 MongoDB Validation Errors:');
                Object.keys(error.errors).forEach(key => {
                    console.error(`  - ${key}: ${error.errors[key].message}`);
                });
            }
            
            if (error.code === 11000) {
                console.error('🔑 Duplicate key error:', error.keyPattern);
            }
            
            throw error;
        }
    }

    static async findByTelegramIdOrPhone(telegramId, phone) {
        try {
            return await Agent.findOne({
                $or: [
                    { telegramId: telegramId },
                    { phone: phone }
                ]
            });
        } catch (error) {
            console.error('AgentServiceMongo.findByTelegramIdOrPhone Error:', error);
            return null;
        }
    }

    static async getAllAgents() {
        try {
            return await Agent.find({});
        } catch (error) {
            console.error('Error getting all agents:', error);
            return [];
        }
    }

    static async getAgentCount() {
        try {
            return await Agent.countDocuments();
        } catch (error) {
            console.error('Error counting agents:', error);
            return 0;
        }
    }

    static async checkAgentRegistration(telegramId) {
        try {
            const agent = await Agent.findOne({ telegramId: telegramId });
            return agent && agent.isRegistered;
        } catch (error) {
            console.error('Error checking registration:', error);
            return false;
        }
    }

    static async getAgent(telegramId) {
        try {
            return await Agent.findOne({ telegramId: telegramId });
        } catch (error) {
            console.error('Error getting agent:', error);
            return null;
        }
    }

    static async debugData() {
        try {
            const count = await Agent.countDocuments();
            const agents = await Agent.find({}).limit(3);
            return { count, sample: agents };
        } catch (error) {
            return { error: error.message };
        }
    }

    static async clearAgents() {
        if (process.env.NODE_ENV !== 'production') {
            await Agent.deleteMany({});
        }
    }

    static async testFileOperations() {
        return { message: 'MongoDB service - no file operations' };
    }
}

module.exports = AgentServiceMongo;