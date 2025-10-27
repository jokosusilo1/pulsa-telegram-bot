const ApiService = require('../../server/services/ApiService');
const AgentService = require('../services/AgentService');

const apiService = new ApiService();

// Fungsi untuk menampilkan balance yang bisa dipanggil oleh command dan callback
async function showBalance(bot, chatId, user = null) {
    try {
        // Dapatkan data agent jika user tersedia
        let agentData = null;
        if (user) {
            agentData = await AgentService.getAgent(user.id.toString());
        }

        const result = await apiService.getBalance();
        
        if (result.success) {
            let balanceMessage = `💰 <b>INFORMASI SALDO</b>\n\n`;
            
            // Tambahkan info agent jika ada
            if (agentData) {
                balanceMessage += `👤 <b>Agent:</b> ${agentData.name}\n` +
                                `📞 <b>Telepon:</b> ${agentData.phone}\n\n`;
            }
            
            balanceMessage += `💵 <b>Saldo Deposit:</b> Rp ${result.data.balance?.toLocaleString('id-ID') || '0'}\n` +
                            `🏦 <b>Mata Uang:</b> ${result.data.currency || 'IDR'}\n\n` +
                            `📊 <b>Status:</b> ${result.data.balance > 0 ? '✅ Aktif' : '⚠️ Saldo Habis'}\n\n` +
                            `💡 <b>Tips:</b> Lakukan deposit untuk terus bertransaksi.`;

            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '💳 DEPOSIT SEKARANG', callback_data: 'show_deposit' },
                            { text: '📋 RIWAYAT', callback_data: 'show_history' }
                        ],
                        [
                            { text: '⬅️ KEMBALI KE MENU', callback_data: 'show_main_menu' }
                        ]
                    ]
                }
            };

            await bot.sendMessage(chatId, balanceMessage, {
                parse_mode: 'HTML',
                ...keyboard
            });
            
        } else {
            const errorMessage = `❌ <b>Gagal mengambil informasi saldo</b>\n\n` +
                               `Silakan coba lagi atau hubungi admin.`;
            
            await bot.sendMessage(chatId, errorMessage, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🔄 COBA LAGI', callback_data: 'check_balance' },
                            { text: '📞 HUBUNGI ADMIN', callback_data: 'show_contact' }
                        ]
                    ]
                }
            });
        }
    } catch (error) {
        console.error('Error getting balance:', error);
        
        const errorMessage = `❌ <b>Terjadi Kesalahan</b>\n\n` +
                           `Gagal mengambil informasi saldo.\n\n` +
                           `💡 <b>Solusi:</b>\n` +
                           `• Periksa koneksi internet\n` +
                           `• Coba lagi beberapa saat\n` +
                           `• Hubungi admin jika masalah berlanjut`;

        await bot.sendMessage(chatId, errorMessage, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🔄 COBA LAGI', callback_data: 'check_balance' },
                        { text: '📞 HUBUNGI ADMIN', callback_data: 'show_contact' }
                    ],
                    [
                        { text: '⬅️ KEMBALI KE MENU', callback_data: 'show_main_menu' }
                    ]
                ]
            }
        });
    }
}

// Handler untuk command text (/balance)
const balanceCommand = (bot) => {
    console.log('🔄 Loading balance command...');

    bot.onText(/\/balance|💰 CEK SALDO/, async (msg) => {
        const chatId = msg.chat.id;
        const user = msg.from;
        await showBalance(bot, chatId, user);
    });
};

// Export command handler dan fungsi showBalance
module.exports = balanceCommand;
module.exports.showBalance = showBalance;