const AgentStorage = require('../commands/storage/AgentStorage');

class AgentServiceJSON {
    static async checkAgentRegistration(telegramId) {
        try {
            console.log(`🔍 [AgentStorage] Checking registration for: ${telegramId}`);
            
            const agent = AgentStorage.getAgent(telegramId);
            const isRegistered = agent && agent.isRegistered;
            
            console.log(`📊 [AgentStorage] Registration status: ${isRegistered}`);
            return isRegistered;
            
        } catch (error) {
            console.error('❌ [AgentStorage] Error checking registration:', error.message);
            return false;
        }
    }

    static async getAgent(telegramId) {
        try {
            console.log(`🔍 [AgentStorage] Getting agent: ${telegramId}`);
            
            const agent = AgentStorage.getAgent(telegramId);
            
            if (agent) {
                console.log(`✅ [AgentStorage] Agent found: ${agent.name}`);
            } else {
                console.log(`❌ [AgentStorage] Agent not found: ${telegramId}`);
            }
            
            return agent;
        } catch (error) {
            console.error('❌ [AgentStorage] Error getting agent:', error.message);
            return null;
        }
    }

    static async createAgent(agentData) {
        try {
            console.log('📝 [AgentStorage] Creating agent:', agentData);
            
            const telegramId = agentData.telegramId;
            
            // Cek duplikat
            if (AgentStorage.getAgent(telegramId)) {
                throw new Error(`Agent with Telegram ID ${telegramId} already exists`);
            }
            
            // Buat agent baru
            const newAgent = {
                ...agentData,
                isRegistered: true,
                registrationStep: 'completed',
                balance: agentData.balance || 0,
                registeredAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            AgentStorage.saveAgent(telegramId, newAgent);
            
            console.log('✅ [AgentStorage] Agent created successfully:', newAgent.name);
            return newAgent;
            
        } catch (error) {
            console.error('❌ [AgentStorage] Error creating agent:', error.message);
            throw error;
        }
    }

    static async updateRegistrationStep(telegramId, step) {
        try {
            const agent = AgentStorage.getAgent(telegramId);
            if (agent) {
                agent.registrationStep = step;
                agent.updatedAt = new Date().toISOString();
                AgentStorage.saveAgent(telegramId, agent);
                console.log(`✅ [AgentStorage] Updated step to ${step} for: ${telegramId}`);
            }
            return agent;
        } catch (error) {
            console.error('❌ [AgentStorage] Error updating registration step:', error.message);
            throw error;
        }
    }

    static async saveRegistrationData(telegramId, data) {
        try {
            const agent = AgentStorage.getAgent(telegramId);
            if (!agent) {
                throw new Error('Agent not found');
            }

            // Update data
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    agent[key] = data[key];
                }
            });
            
            agent.updatedAt = new Date().toISOString();
            AgentStorage.saveAgent(telegramId, agent);
            
            console.log(`✅ [AgentStorage] Saved registration data for: ${telegramId}`);
            return agent;
        } catch (error) {
            console.error('❌ [AgentStorage] Error saving registration data:', error.message);
            throw error;
        }
    }

    static async completeRegistration(telegramId) {
        try {
            const agent = AgentStorage.getAgent(telegramId);
            if (agent) {
                agent.isRegistered = true;
                agent.registrationStep = 'completed';
                agent.updatedAt = new Date().toISOString();
                AgentStorage.saveAgent(telegramId, agent);
                console.log(`✅ [AgentStorage] Completed registration for: ${telegramId}`);
            }
            return agent;
        } catch (error) {
            console.error('❌ [AgentStorage] Error completing registration:', error.message);
            throw error;
        }
    }

    static async verifyPin(telegramId, candidatePin) {
        try {
            const agent = AgentStorage.getAgent(telegramId);
            
            if (!agent || !agent.pin) {
                return false;
            }
            
            // Simple PIN comparison
            const isMatch = agent.pin === candidatePin;
            console.log(`🔐 [AgentStorage] PIN verification for ${telegramId}: ${isMatch}`);
            return isMatch;
        } catch (error) {
            console.error('❌ [AgentStorage] Error verifying PIN:', error.message);
            return false;
        }
    }

    static async updateBalance(telegramId, amount) {
        try {
            const agent = AgentStorage.getAgent(telegramId);
            if (agent) {
                agent.balance = (agent.balance || 0) + amount;
                agent.updatedAt = new Date().toISOString();
                AgentStorage.saveAgent(telegramId, agent);
                console.log(`💰 [AgentStorage] Updated balance for ${telegramId}: ${agent.balance}`);
            }
            return agent;
        } catch (error) {
            console.error('❌ [AgentStorage] Error updating balance:', error.message);
            throw error;
        }
    }

    // Helper methods untuk development
    static async getAllAgents() {
        return AgentStorage.getAllAgents();
    }

    static async getAgentCount() {
        return AgentStorage.getAgentCount();
    }

    static async clearAgents() {
        // Note: AgentStorage tidak punya clear method, jadi kita buat manual
        // Ini untuk testing purposes saja
        console.log('⚠️ [AgentStorage] Clear method not available - data persists in memory');
    }
}

module.exports = AgentServiceJSON;