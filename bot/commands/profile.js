const ApiService = require('../services/ApiService');


module.exports = (bot) => {
    console.log('🔄 Loading profile command...');

    bot.onText(/\/profile|👤 PROFILE AGENT/, async (msg) => {
        const chatId = msg.chat.id;
        const user = msg.from;
        
        // Untuk testing, gunakan dummy data
        const dummyAgent = {
            name: user.first_name,
            phone: '08123456789',
            email: 'user@example.com',
            balance: 100000,
            _id: 'AG' + Date.now(),
            isActive: true,
            createdAt: new Date()
        };
        
        const profileMessage = `👤 PROFILE AGENT

📛 Nama: ${dummyAgent.name}
🆔 Agent ID: ${dummyAgent._id}
📱 Telepon: ${dummyAgent.phone}
📧 Email: ${dummyAgent.email}
💰 Saldo: Rp ${dummyAgent.balance.toLocaleString('id-ID')}
📊 Status: ${dummyAgent.isActive ? '✅ Aktif' : '❌ Nonaktif'}
📅 Terdaftar: ${dummyAgent.createdAt.toLocaleDateString('id-ID')}`;

        bot.sendMessage(chatId, profileMessage);
    });
};