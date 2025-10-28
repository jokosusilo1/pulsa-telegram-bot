// bot/services/AgentService.js - VERSION FINAL
const environment = process.env.NODE_ENV || 'development';

console.log('🔧 Initializing AgentService in bot/services/...');
console.log('🌍 Environment:', environment);

let SelectedAgentService;

if (environment === 'production') {
    try {
        SelectedAgentService = require('./AgentServiceMongo');
        console.log('🚀 Using MongoDB for AgentService (PRODUCTION)');
    } catch (error) {
        console.error('❌ MongoDB service failed, falling back to JSON:', error.message);
        SelectedAgentService = require('./AgentServiceJSON');
    }
} else {
    SelectedAgentService = require('./AgentServiceJSON');
    console.log('📁 Using JSON Storage for AgentService (DEVELOPMENT)');
}

// Test service on startup
async function initializeService() {
    try {
        console.log('🧪 Testing AgentService...');
        const agents = await SelectedAgentService.getAllAgents();
        console.log(`✅ AgentService initialized: ${agents.length} agents found`);
    } catch (error) {
        console.error('❌ AgentService initialization test failed:', error.message);
        // Don't throw, let service continue
    }
}

// Initialize immediately
initializeService();

// Export methods
module.exports = {
    checkAgentRegistration: SelectedAgentService.checkAgentRegistration,
    getAgent: SelectedAgentService.getAgent,
    createAgent: SelectedAgentService.createAgent,
    getAllAgents: SelectedAgentService.getAllAgents,
    getAgentCount: SelectedAgentService.getAgentCount,
    debugData: SelectedAgentService.debugData,
    clearAgents: SelectedAgentService.clearAgents,
    testFileOperations: SelectedAgentService.testFileOperations,
    
    // Export untuk debugging
    _serviceType: environment === 'production' ? 'MongoDB' : 'JSON',
    _selectedService: SelectedAgentService
};