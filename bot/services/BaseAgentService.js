class BaseAgentService {
    static async checkAgentRegistration(telegramId) {
        throw new Error('Method not implemented');
    }

    static async getAgent(telegramId) {
        throw new Error('Method not implemented');
    }

    static async createAgent(agentData) {
        throw new Error('Method not implemented');
    }

    static async updateRegistrationStep(telegramId, step) {
        throw new Error('Method not implemented');
    }

    static async saveRegistrationData(telegramId, data) {
        throw new Error('Method not implemented');
    }

    static async completeRegistration(telegramId) {
        throw new Error('Method not implemented');
    }

    static async verifyPin(telegramId, candidatePin) {
        throw new Error('Method not implemented');
    }

    static async updateBalance(telegramId, amount) {
        throw new Error('Method not implemented');
    }
}

module.exports = BaseAgentService;

