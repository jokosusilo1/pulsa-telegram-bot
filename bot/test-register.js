

const AgentService = require('./bot/services/AgentService');

async function testRegistrationStatus() {
    console.log('🧪 Testing Registration Status...');
    
    const testUsers = [
        '6246004002', // Ganti dengan user ID yang sudah registrasi
        '123456789'   // Ganti dengan user ID yang belum registrasi
    ];
    
    for (const userId of testUsers) {
        try {
            console.log(`\n🔍 Testing user: ${userId}`);
            
            // Test 1: Check registration
            const isRegistered = await AgentService.checkAgentRegistration(userId);
            console.log(`✅ Registration status: ${isRegistered}`);
            
            // Test 2: Get agent data
            const agent = await AgentService.getAgent(userId);
            if (agent) {
                console.log(`✅ Agent found:`, {
                    name: agent.name,
                    phone: agent.phone,
                    isRegistered: agent.isRegistered,
                    balance: agent.balance
                });
            } else {
                console.log('❌ Agent not found');
            }
            
        } catch (error) {
            console.error(`❌ Error testing user ${userId}:`, error.message);
        }
    }
}

testRegistrationStatus().catch(console.error);