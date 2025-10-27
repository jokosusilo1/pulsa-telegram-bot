const config = require('../config');
const AgentServiceJSON = require('./AgentServiceJSON');
const AgentServiceMongo = require('./AgentServiceMongo');

// Pilih service berdasarkan environment
const isProduction = config.environment === 'production';
const SelectedAgentService = isProduction ? AgentServiceMongo : AgentServiceJSON;

console.log(`🚀 Using ${isProduction ? 'MongoDB' : 'JSON Storage'} for AgentService`);

// Ekspor semua static methods dari service yang dipilih
module.exports = {
    checkAgentRegistration: SelectedAgentService.checkAgentRegistration,
    getAgent: SelectedAgentService.getAgent,
    createAgent: SelectedAgentService.createAgent,
    updateRegistrationStep: SelectedAgentService.updateRegistrationStep,
    saveRegistrationData: SelectedAgentService.saveRegistrationData,
    completeRegistration: SelectedAgentService.completeRegistration,
    verifyPin: SelectedAgentService.verifyPin,
    updateBalance: SelectedAgentService.updateBalance,
    
    // Export service type untuk testing/debugging
    _serviceType: isProduction ? 'MongoDB' : 'JSON',
    _selectedService: SelectedAgentService
};