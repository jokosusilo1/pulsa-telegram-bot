// services/AgentServiceJSON.js - PURE FUNCTIONS
const fs = require('fs').promises;
const path = require('path');

const dataFile = path.join(__dirname, '../../data/agents.json');

// Helper functions
async function ensureDataFile() {
    try {
        const dataDir = path.dirname(dataFile);
        await fs.mkdir(dataDir, { recursive: true });
        
        try {
            await fs.access(dataFile);
        } catch {
            await fs.writeFile(dataFile, JSON.stringify([]));
            console.log('📁 Created new agents.json file');
        }
    } catch (error) {
        console.error('❌ Error ensuring data file:', error);
        throw error;
    }
}

async function loadAgents() {
    try {
        await ensureDataFile();
        const data = await fs.readFile(dataFile, 'utf8');
        const agents = data.trim() ? JSON.parse(data) : [];
        console.log(`📊 Loaded ${agents.length} agents from JSON`);
        return agents;
    } catch (error) {
        console.error('❌ Error loading agents:', error);
        return [];
    }
}

async function saveAgents(agents) {
    try {
        await ensureDataFile();
        await fs.writeFile(dataFile, JSON.stringify(agents, null, 2));
        console.log(`💾 Saved ${agents.length} agents to JSON`);
        return true;
    } catch (error) {
        console.error('❌ Error saving agents:', error);
        throw error;
    }
}

// Main functions
async function checkAgentRegistration(telegramId) {
    try {
        console.log(`🔍 Checking registration for: ${telegramId}`);
        const agents = await loadAgents();
        const agent = agents.find(a => a.telegramId === telegramId || a.userId === telegramId);
        const isRegistered = !!(agent && agent.isRegistered);
        console.log(`📊 Registration status: ${isRegistered}`);
        return isRegistered;
    } catch (error) {
        console.error('❌ Error checking registration:', error);
        return false;
    }
}

async function getAgent(telegramId) {
    try {
        console.log(`🔍 Getting agent: ${telegramId}`);
        const agents = await loadAgents();
        const agent = agents.find(a => a.telegramId === telegramId || a.userId === telegramId);
        
        if (agent) {
            console.log(`✅ Agent found: ${agent.name}`);
        } else {
            console.log(`❌ Agent not found: ${telegramId}`);
        }
        
        return agent || null;
    } catch (error) {
        console.error('❌ Error getting agent:', error);
        return null;
    }
}

async function createAgent(agentData) {
    try {
        console.log('📝 Creating agent:', agentData);
        
        const agents = await loadAgents();
        const telegramId = agentData.telegramId;
        
        if (!telegramId) {
            throw new Error('Missing telegramId');
        }
        
        // Check duplicate
        const existingAgent = agents.find(a => a.telegramId === telegramId);
        if (existingAgent) {
            console.log(`⚠️ Agent already exists: ${telegramId}`);
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
        
        agents.push(newAgent);
        await saveAgents(agents);
        
        console.log(`✅ Agent created successfully: ${newAgent.name}`);
        return newAgent;
        
    } catch (error) {
        console.error('❌ Error creating agent:', error);
        throw error;
    }
}

async function getAllAgents() {
    try {
        return await loadAgents();
    } catch (error) {
        console.error('❌ Error getting all agents:', error);
        return [];
    }
}

async function getAgentCount() {
    try {
        const agents = await loadAgents();
        return agents.length;
    } catch (error) {
        console.error('❌ Error getting agent count:', error);
        return 0;
    }
}

async function debugData() {
    try {
        const agents = await loadAgents();
        console.log('🔍 DEBUG DATA - Total agents:', agents.length);
        
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
        console.error('❌ Error debugging data:', error);
        return [];
    }
}

async function clearAgents() {
    try {
        await saveAgents([]);
        console.log('✅ Cleared all agents');
    } catch (error) {
        console.error('❌ Error clearing agents:', error);
        throw error;
    }
}

async function testFileOperations() {
    try {
        console.log('🧪 Testing file operations...');
        const agents = await loadAgents();
        await saveAgents(agents);
        console.log('✅ File operations test passed');
        return true;
    } catch (error) {
        console.error('❌ File operations test failed:', error);
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