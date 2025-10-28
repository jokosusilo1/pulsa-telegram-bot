// services/AgentService.js - KOREKSI
const config = require('../config');

let SelectedAgentService;

// Pilih service berdasarkan environment
if (config.environment === 'production') {
    try {
        SelectedAgentService = require('./AgentServiceMongo');
        console.log('🚀 Using MongoDB for AgentService (PRODUCTION)');
    } catch (error) {
        console.error('❌ MongoDB not available, falling back to JSON:', error);
        SelectedAgentService = require('./AgentServiceJSON');
    }
} else {
    SelectedAgentService = require('./AgentServiceJSON');
    console.log('📁 Using JSON Storage for AgentService (DEVELOPMENT)');
}

// Test service on startup - DIPERBAIKI
async function initializeService() {
    try {
        console.log('🧪 Testing AgentService...');
        
        // Test basic operations - gunakan method yang tersedia
        const agents = await SelectedAgentService.getAllAgents();
        console.log(`✅ AgentService test passed: ${agents.length} agents found`);
        
    } catch (error) {
        console.error('❌ AgentService test failed:', error);
        // Jangan throw error, biarkan service tetap berjalan
    }
}

// Initialize immediately
initializeService();

// ✅ KOREKSI: Export methods langsung tanpa wrapper function
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
    _serviceType: config.environment === 'production' ? 'MongoDB' : 'JSON',
    _selectedService: SelectedAgentService
};