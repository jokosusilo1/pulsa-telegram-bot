const AgentStorage = require('./storage/AgentStorage');

module.exports = (bot) => {
    console.log("🔄 Loading deposit system...");

    // Command /deposit
    bot.onText(/\/deposit/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        try {
            const agent = AgentStorage.getAgent(userId);
            if (!agent) {
                return bot.sendMessage(chatId, '❌ Anda belum terdaftar sebagai agent.');
            }

            await showDepositInstructions(bot, chatId, agent);
        } catch (error) {
            console.error('Error in /deposit:', error);
            bot.sendMessage(chatId, '❌ Gagal menampilkan info deposit.');
        }
    });

    // Handler untuk tombol DEPOSIT (message)
    bot.on('message', async (msg) => {
        if (!msg.text) return;
        
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const text = msg.text;

        if (text === '💰 DEPOSIT' || text === '💰 DEPOSIT SALDO') {
            try {
                const agent = AgentStorage.getAgent(userId);
                
                if (!agent) {
                    return bot.sendMessage(chatId, '❌ Anda belum terdaftar sebagai agent.');
                }

                await showDepositInstructions(bot, chatId, agent);
            } catch (error) {
                console.error('Error in deposit button:', error);
                bot.sendMessage(chatId, '❌ Gagal memproses deposit.');
            }
        }
        else if (text === '💳 KONFIRMASI DEPOSIT') {
            await showDepositConfirmation(bot, chatId);
        }
        else if (text === '💰 CEK SALDO') {
            await showBalance(bot, chatId, userId);
        }
    });

    // ✅ TAMBAHKAN HANDLER UNTUK CALLBACK QUERIES (jika ada tombol inline)
    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const userId = callbackQuery.from.id.toString();
        const data = callbackQuery.data;

        try {
            if (data === 'deposit_instructions') {
                const agent = AgentStorage.getAgent(userId);
                if (!agent) {
                    await bot.answerCallbackQuery(callbackQuery.id, { 
                        text: "❌ Anda belum terdaftar sebagai agent." 
                    });
                    return;
                }
                await showDepositInstructions(bot, chatId, agent);
            }
            else if (data === 'check_balance') {
                await showBalance(bot, chatId, userId);
            }
            else if (data === 'confirm_deposit') {
                await showDepositConfirmation(bot, chatId);
            }

            await bot.answerCallbackQuery(callbackQuery.id);
        } catch (error) {
            console.error('Error in deposit callback:', error);
            await bot.answerCallbackQuery(callbackQuery.id, { 
                text: "❌ Terjadi kesalahan" 
            });
        }
    });

    console.log("✅ Deposit system loaded");
};

// ✅ TAMPILKAN INSTRUKSI DEPOSIT (DIPERBAIKI)
async function showDepositInstructions(bot, chatId, agent) {
    try {
        // Pastikan agent memiliki balance
        const balance = agent.balance || 0;
        
        const message = `💰 *DEPOSIT SALDO*

💳 *Saldo Saat Ini:* Rp ${balance.toLocaleString('id-ID')}

*Transfer ke Rekening Bank:*

🏦 *BANK BCA*
📞 0881-2345-6789
👤 ANDI SANTOSO

🏦 *BANK BRI* 
📞 0889-8765-4321
👤 ANDI SANTOSO

🏦 *BANK BNI*
📞 0882-1357-2468
👤 ANDI SANTOSO

*Cara Deposit:*
1. Transfer ke salah satu rekening di atas
2. Simpan bukti transfer
3. Kirim bukti ke admin
4. Saldo akan ditambahkan dalam 5-15 menit

📝 *Minimal deposit:* Rp 10.000
✅ Pastikan transfer sesuai nominal`;

        const keyboard = {
            reply_markup: {
                keyboard: [
                    ["💳 KONFIRMASI DEPOSIT", "💰 CEK SALDO"],
                    ["📞 HUBUNGI ADMIN", "🏠 MENU UTAMA"]
                ],
                resize_keyboard: true
            }
        };

        await bot.sendMessage(chatId, message, { 
            parse_mode: 'Markdown',
            ...keyboard
        });

    } catch (error) {
        console.error('Error in showDepositInstructions:', error);
        throw error;
    }
}

// ✅ TAMPILKAN KONFIRMASI DEPOSIT (DIPERBAIKI)
async function showDepositConfirmation(bot, chatId) {
    const message = `💳 *KONFIRMASI DEPOSIT*

Untuk konfirmasi deposit:

1. Transfer sesuai nominal
2. Screenshot bukti transfer  
3. Kirim bukti ke admin
4. Admin akan memverifikasi dan menambah saldo Anda

*Pastikan bukti transfer jelas:*
• Nama pengirim
• Jumlah transfer
• Tanggal & waktu
• Bank tujuan

⏱️ Saldo akan aktif dalam 5-15 menit setelah konfirmasi`;

    await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown'
    });
}

// ✅ TAMPILKAN SALDO (DIPERBAIKI)
async function showBalance(bot, chatId, userId) {
    try {
        const agent = AgentStorage.getAgent(userId);
        if (!agent) {
            return bot.sendMessage(chatId, '❌ Anda belum terdaftar sebagai agent.');
        }

        const balance = agent.balance || 0;
        const agentName = agent.name || 'Tidak ada nama';
        const agentId = agent.agentId || 'Tidak ada ID';
        const status = agent.status || 'Aktif';

        const message = `💰 *INFO SALDO*

👤 *Nama:* ${agentName}
🆔 *Agent ID:* ${agentId}
💳 *Saldo:* Rp ${balance.toLocaleString('id-ID')}
📊 *Status:* ${status}

💡 *Tips:*
• Deposit untuk mulai transaksi
• Minimal saldo untuk transaksi: Rp 5.000
• Saldo tidak bisa minus`;

        const keyboard = {
            reply_markup: {
                keyboard: [
                    ["💰 DEPOSIT SALDO", "📊 LAPORAN"],
                    ["🏠 MENU UTAMA"]
                ],
                resize_keyboard: true
            }
        };

        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            ...keyboard
        });

    } catch (error) {
        console.error('Error showing balance:', error);
        bot.sendMessage(chatId, '❌ Gagal mengambil informasi saldo.');
    }
}

// ✅ FUNGSI TAMBAHAN: CEK AGENT EXISTS
function checkAgentExists(userId) {
    try {
        const agent = AgentStorage.getAgent(userId);
        return !!agent;
    } catch (error) {
        console.error('Error checking agent:', error);
        return false;
    }
}