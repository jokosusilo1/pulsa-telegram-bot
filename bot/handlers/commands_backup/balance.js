const StorageService = require('../../../server/services/StorageService');

module.exports = (bot) => {
    bot.onText(/\/balance/, async (msg) => {
        const chatId = msg.chat.id;
        const agentId = chatId.toString();

        try {
            const agent = await StorageService.getAgent(agentId);
            
            if (!agent) {
                return bot.sendMessage(chatId, 
                    '❌ Anda belum terdaftar sebagai agent.\nLakukan pesanan pertama untuk mendaftar otomatis.',
                    { parse_mode: 'Markdown' }
                );
            }

            const stats = await StorageService.getAgentStats(agentId);

            const balanceMessage = `
💰 **INFO SALDO**

👤 Agent: ${agent.name || 'N/A'}
📞 Phone: ${agent.phone || 'N/A'}

💳 **Saldo:** Rp ${agent.balance.toLocaleString('id-ID')}

📊 **Statistik Hari Ini:**
🛒 Transaksi: ${stats.todayTransactions}
📈 Penjualan: Rp ${stats.todaySales.toLocaleString('id-ID')}
💸 Komisi: Rp ${stats.todayCommission.toLocaleString('id-ID')}
            `;

            bot.sendMessage(chatId, balanceMessage, { 
                parse_mode: 'Markdown'
            });

        } catch (error) {
            console.error('Error in /balance command:', error);
            bot.sendMessage(chatId, '❌ Gagal mengambil informasi saldo.');
        }
    });
    
    console.log("✅ Balance command registered");
};