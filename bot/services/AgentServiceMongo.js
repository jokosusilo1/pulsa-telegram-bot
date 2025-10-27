
const BaseAgentService = require('./BaseAgentService');
const Agent = require('../../server/models/Agent'); // MongoDB model

class AgentServiceMongo extends BaseAgentService {
    static async checkAgentRegistration(telegramId) {
        try {
            console.log(`🔍 [MongoDB] Checking registration for: ${telegramId}`);
            
            const agent = await Agent.findOne({ telegramId });
            const isRegistered = agent && agent.isRegistered;
            
            console.log(`📊 [MongoDB] Registration status: ${isRegistered}`);
            return isRegistered;
            
        } catch (error) {
            console.error('❌ [MongoDB] Error checking registration:', error.message);
            return false;
        }
    }

    static async getAgent(telegramId) {
        try {
            console.log(`🔍 [MongoDB] Getting agent: ${telegramId}`);
            
            const agent = await Agent.findOne({ telegramId });
            
            if (agent) {
                console.log(`✅ [MongoDB] Agent found: ${agent.name}`);
            } else {
                console.log(`❌ [MongoDB] Agent not found: ${telegramId}`);
            }
            
            return agent;
        } catch (error) {
            console.error('❌ [MongoDB] Error getting agent:', error.message);
            return null;
        }
    }

    static async createAgent(agentData) {
        try {
            console.log('📝 [MongoDB] Creating agent:', agentData);
            
            const agent = new Agent(agentData);
            const savedAgent = await agent.save();
            
            console.log('✅ [MongoDB] Agent created successfully:', savedAgent.name);
            return savedAgent;
            
        } catch (error) {
            console.error('❌ [MongoDB] Error creating agent:', error.message);
            
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                throw new Error(`${field} sudah terdaftar`);
            }
            
            throw error;
        }
    }

    static async updateRegistrationStep(telegramId, step) {
        try {
            const agent = await Agent.findOneAndUpdate(
                { telegramId },
                { registrationStep: step },
                { new: true }
            );
            console.log(`✅ [MongoDB] Updated step to ${step} for: ${telegramId}`);
            return agent;
        } catch (error) {
            console.error('❌ [MongoDB] Error updating registration step:', error.message);
            throw error;
        }
    }

    static async saveRegistrationData(telegramId, data) {
        try {
            const agent = await Agent.findOne({ telegramId });
            if (!agent) {
                throw new Error('Agent not found');
            }

            // Update fields
            Object.keys(data).forEach(key => {
                if (key !== 'pin' && data[key] !== undefined && data[key] !== null) {
                    agent[key] = data[key];
                }
            });

            // Handle PIN separately untuk hashing
            if (data.pin) {
                agent.pin = data.pin; // Akan di-hash oleh pre-save hook di model
            }

            const savedAgent = await agent.save();
            console.log(`✅ [MongoDB] Saved registration data for: ${telegramId}`);
            return savedAgent;
        } catch (error) {
            console.error('❌ [MongoDB] Error saving registration data:', error.message);
            throw error;
        }
    }

    static async completeRegistration(telegramId) {
        try {
            const agent = await Agent.findOneAndUpdate(
                { telegramId },
                { 
                    isRegistered: true,
                    registrationStep: 'completed'
                },
                { new: true }
            );
            console.log(`✅ [MongoDB] Completed registration for: ${telegramId}`);
            return agent;
        } catch (error) {
            console.error('❌ [MongoDB] Error completing registration:', error.message);
            throw error;
        }
    }

    static async verifyPin(telegramId, candidatePin) {
        try {
            const agent = await Agent.findOne({ telegramId });
            if (!agent || !agent.pin) {
                return false;
            }
            
            const isMatch = await agent.verifyPin(candidatePin);
            console.log(`🔐 [MongoDB] PIN verification for ${telegramId}: ${isMatch}`);
            return isMatch;
        } catch (error) {
            console.error('❌ [MongoDB] Error verifying PIN:', error.message);
            return false;
        }
    }

    static async updateBalance(telegramId, amount) {
        try {
            const agent = await Agent.findOneAndUpdate(
                { telegramId },
                { $inc: { balance: amount } },
                { new: true }
            );
            console.log(`💰 [MongoDB] Updated balance for ${telegramId}: ${agent.balance}`);
            return agent;
        } catch (error) {
            console.error('❌ [MongoDB] Error updating balance:', error.message);
            throw error;
        }
    }
}

module.exports = AgentServiceMongo;
