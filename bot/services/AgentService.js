// bot/services/AgentService.js - FORCE PRODUCTION CHECK
const environment = process.env.NODE_ENV || 'development';

console.log('🔧 ========== AGENT SERVICE INITIALIZATION ==========');
console.log('🌍 Environment variable:', process.env.NODE_ENV);
console.log('🔧 Detected environment:', environment);
console.log('📁 Current directory:', process.cwd());

let SelectedAgentService;

// ✅ STRICT CHECK FOR PRODUCTION
if (environment === 'production') {
    console.log('🚀 PRODUCTION MODE DETECTED - Using MongoDB');
    
    try {
        // Check if MongoDB URI is available
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in production environment');
        }
        
        console.log('🔗 MongoDB URI is available');
        SelectedAgentService = require('./AgentServiceMongo');
        console.log('✅ AgentServiceMongo loaded successfully');
        
    } catch (error) {
        console.error('💥 CRITICAL: Failed to initialize MongoDB in production:');
        console.error('Error:', error.message);
        console.error('This will break registration in production!');
        throw error; // Jangan fallback ke JSON di production!
    }
} else {
    console.log('💾 DEVELOPMENT MODE - Using JSON Storage');
    SelectedAgentService = require('./AgentServiceJSON');
}

// Test service dengan logging detail
async function initializeService() {
    try {
        console.log('🧪 Testing AgentService initialization...');
        const agents = await SelectedAgentService.getAllAgents();
        console.log(`✅ AgentService test passed: ${agents.length} agents found`);
        
        // Log service type untuk konfirmasi
        console.log(`🎯 Active Service: ${environment === 'production' ? 'MongoDB' : 'JSON'}`);
        
    } catch (error) {
        console.error('❌ AgentService initialization test failed:', error.message);
        if (environment === 'production') {
            console.error('🚨 PRODUCTION DATABASE ERROR - Registration will fail!');
        }
    }
}

initializeService();

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
    _selectedService: SelectedAgentService,
    _environment: environment
};