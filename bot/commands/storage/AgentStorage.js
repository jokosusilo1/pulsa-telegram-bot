// storage/AgentStorage.js
class AgentStorage {
    constructor() {
        this.agents = new Map();
        this.registrationState = new Map();
        console.log("📦 AgentStorage initialized");
    }

    // Agent management
    saveAgent(userId, agentData) {
        this.agents.set(userId, agentData);
        console.log(`✅ Agent saved: ${userId} - ${agentData.name}`);
        return true;
    }

    getAgent(userId) {
        const agent = this.agents.get(userId);
        if (!agent) {
            console.log(`❌ Agent not found: ${userId}`);
        }
        return agent;
    }

    updateAgent(userId, updates) {
        const agent = this.agents.get(userId);
        if (agent) {
            this.agents.set(userId, { ...agent, ...updates });
            console.log(`✅ Agent updated: ${userId}`);
            return true;
        }
        return false;
    }

    // Registration state management
    saveRegistrationState(userId, state) {
        this.registrationState.set(userId, state);
        return true;
    }

    getRegistrationState(userId) {
        return this.registrationState.get(userId);
    }

    deleteRegistrationState(userId) {
        return this.registrationState.delete(userId);
    }

    // Utility methods
    getAllAgents() {
        return Array.from(this.agents.values());
    }

    getAgentCount() {
        return this.agents.size;
    }

    // Cek apakah nomor/email sudah terdaftar
    isPhoneRegistered(phone) {
        return this.getAllAgents().some(agent => agent.phone === phone);
    }

    isEmailRegistered(email) {
        return this.getAllAgents().some(agent => agent.email === email);
    }
}

// Export singleton instance
module.exports = new AgentStorage();
