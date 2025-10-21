// ✅ PATH YANG BENAR - dari commands/balance.js ke server/services/StorageService
const path = require('path');
const StorageService = require(path.join(__dirname, '..', '..', 'server', 'services', 'StorageService'));
module.exports = (bot) => {
    console.log("🔄 Loading /balance command...");

    // Command: /balance
    bot.onText(/\/balance/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        try {
            // Dapatkan data agent
            const agent = await StorageService.getAgent(userId);
            
            if (!agent) {
                return bot.sendMessage(chatId, 
                    '❌ Anda belum terdaftar sebagai agent.\n' +
                    'Gunakan /start untuk mendaftar terlebih dahulu.'
                );
            }

            const balanceMessage = `
💼 **INFO SALDO AGENT**

👤 **Nama:** ${agent.name}
🆔 **Agent ID:** ${agent.agentId || userId}
💰 **Saldo:** Rp ${agent.balance.toLocaleString('id-ID')}
📊 **Status:** ${agent.status || 'Aktif'}

💡 **Fitur:**
• Deposit saldo
• Cek riwayat transaksi
• Tarik saldo
            `;

            const keyboard = {
                reply_markup: {
                    keyboard: [
                        ["💰 DEPOSIT", "📊 RIWAYAT"],
                        ["💳 TARIK SALDO", "🏠 MENU UTAMA"]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: false
                }
            };

            bot.sendMessage(chatId, balanceMessage, { 
                parse_mode: 'Markdown',
                ...keyboard
            });

        } catch (error) {
            console.error('Error in /balance:', error);
            bot.sendMessage(chatId, '❌ Gagal mengambil informasi saldo.');
        }
    });

    // Handler untuk tombol balance
    bot.on('message', async (msg) => {
        if (!msg.text) return;
        
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const text = msg.text;

        try {
            if (text === '💰 DEPOSIT') {
                await showDepositInstructions(bot, chatId);
            }
            else if (text === '📊 RIWAYAT') {
                await showTransactionHistory(bot, chatId, userId);
            }
            else if (text === '💳 TARIK SALDO') {
                await showWithdrawalInstructions(bot, chatId, userId);
            }
        } catch (error) {
            console.error('Error in balance button:', error);
        }
    });

    console.log("✅ /balance command loaded");
};

// Helper functions
async function showDepositInstructions(bot, chatId) {
    const message = `
💰 **DEPOSIT SALDO**

Untuk deposit saldo, silakan transfer ke:

🏦 **Bank:** BCA
📞 **Rekening:** 123-456-7890
👤 **Atas Nama:** NAMA ADMIN

💰 **Bank:** BRI  
📞 **Rekening:** 098-765-4321
👤 **Atas Nama:** NAMA ADMIN

**Setelah transfer:**
1. Kirim bukti transfer ke admin
2. Saldo akan ditambahkan dalam 5-10 menit
3. Cek saldo dengan /balance

📞 **Admin:** @username_admin
    `;

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

async function showTransactionHistory(bot, chatId, userId) {
    try {
        // Dapatkan riwayat transaksi dari StorageService
        const transactions = await StorageService.getAgentTransactions(userId);
        
        if (!transactions || transactions.length === 0) {
            return bot.sendMessage(chatId, '📭 Tidak ada riwayat transaksi.');
        }

        let message = '📊 **RIWAYAT TRANSAKSI**\n\n';
        
        transactions.slice(0, 10).forEach((transaction, index) => {
            const date = new Date(transaction.date).toLocaleDateString('id-ID');
            const type = transaction.type === 'deposit' ? '💰 Deposit' : '💳 Penarikan';
            const status = transaction.status === 'success' ? '✅' : '⏳';
            
            message += `${index + 1}. ${type} ${status}\n`;
            message += `   Rp ${transaction.amount.toLocaleString('id-ID')}\n`;
            message += `   ${date}\n\n`;
        });

        if (transactions.length > 10) {
            message += `... dan ${transactions.length - 10} transaksi lainnya`;
        }

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error('Error getting transaction history:', error);
        bot.sendMessage(chatId, '❌ Gagal mengambil riwayat transaksi.');
    }
}

async function showWithdrawalInstructions(bot, chatId, userId) {
    try {
        const agent = await StorageService.getAgent(userId);
        
        if (!agent) {
            return bot.sendMessage(chatId, '❌ Agent tidak ditemukan.');
        }

        const message = `
💳 **PENARIKAN SALDO**

💰 **Saldo Tersedia:** Rp ${agent.balance.toLocaleString('id-ID')}

📋 **Syarat Penarikan:**
• Minimal penarikan: Rp 10.000
• Maksimal penarikan: Rp 5.000.000 per hari
• Proses: 1-2 jam kerja

💼 **Untuk penarikan:**
1. Pastikan saldo mencukupi
2. Kirim permintaan ke admin
3. Sertakan nomor rekening tujuan

📞 **Hubungi Admin:** @username_admin

⚠️ **Pastikan data rekening benar!**
        `;

        const keyboard = {
            reply_markup: {
                keyboard: [
                    ["💰 DEPOSIT", "📊 RIWAYAT"],
                    ["🏠 MENU UTAMA"]
                ],
                resize_keyboard: true
            }
        };

        bot.sendMessage(chatId, message, { 
            parse_mode: 'Markdown',
            ...keyboard
        });

    } catch (error) {
        console.error('Error in withdrawal instructions:', error);
        bot.sendMessage(chatId, '❌ Gagal menampilkan info penarikan.');
    }
}