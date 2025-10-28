// test-database-service.js - TARUH DI ROOT PROJECT
require('dotenv').config();

console.log('🧪 ========== DATABASE SERVICE TEST ==========');
console.log('📁 Current directory:', __dirname);
console.log('🌍 Environment:', process.env.NODE_ENV);

async function testDatabaseService() {
    try {
        console.log('\n1. 🔧 Loading services...');
        
        // ✅ PATH UNTUK ROOT DIRECTORY
        const DatabaseService = require('./services/DatabaseService');
        const AgentService = require('./services/AgentService');
        
        console.log('✅ Services loaded successfully');
        console.log('🔧 AgentService type:', AgentService._serviceType);

        console.log('\n2. 🔗 Testing database connection...');
        await DatabaseService.connect();
        
        const dbStatus = DatabaseService.getStatus();
        console.log('📊 Database Status:', dbStatus);

        if (dbStatus.isConnected) {
            console.log('\n3. 🗄️ Testing MongoDB operations...');
            
            // Test get all agents
            console.log('   📋 Getting all agents...');
            const agents = await AgentService.getAllAgents();
            console.log(`   ✅ Found ${agents.length} agents in MongoDB`);
            
            // Test create agent
            const testAgent = {
                telegramId: 'test_root_' + Date.now(),
                name: 'Root Test User',
                phone: '0812' + Math.random().toString().slice(2, 8),
                email: 'testroot' + Date.now() + '@example.com',
                pin: '1234',
                role: 'agent',
                balance: 0,
                isRegistered: true,
                isActive: true
            };
            
            console.log('   📝 Creating test agent...');
            const agent = await AgentService.createAgent(testAgent);
            console.log('   ✅ Agent created successfully');
            console.log('   🆔 Agent ID:', agent._id);
            console.log('   👤 Agent name:', agent.name);
            
            // Test get agent count
            const count = await AgentService.getAgentCount();
            console.log(`   📊 Total agents in database: ${count}`);
            
        } else {
            console.log('\n3. 📁 Using JSON fallback storage');
            const agents = await AgentService.getAllAgents();
            console.log(`   ✅ Found ${agents.length} agents in JSON storage`);
        }

        console.log('\n🎉 ========== TEST COMPLETED SUCCESSFULLY ==========');

    } catch (error) {
        console.error('\n💥 ========== TEST FAILED ==========');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);
        
        // Additional debug info
        console.log('\n🔍 Debug information:');
        console.log('   Current directory:', process.cwd());
        console.log('   NODE_ENV:', process.env.NODE_ENV);
        console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '*** set ***' : 'MISSING');
    }
}

// Run the test
testDatabaseService();