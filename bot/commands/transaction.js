const AgentStorage = require('./storage/AgentStorage');
const transactionState = new Map();

module.exports = (bot) => {
    console.log("🔄 Loading transaction system...");

    // Handler untuk order dengan PIN verification
    bot.onText(/\/order (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const params = match[1].split(' ');
        
        if (params.length < 2) {
            return bot.sendMessage(chatId, 
                '❌ Format: /order [kode] [nomor]\nContoh: /order AX10 08123456789'
            );
        }

        const agent = AgentStorage.getAgent(userId);
        if (!agent) {
            return bot.sendMessage(chatId, '❌ Anda belum terdaftar sebagai agent.');
        }

        const productCode = params[0];
        const customerNumber = params[1];

        // Simpan state transaksi
        transactionState.set(userId, {
            productCode,
            customerNumber,
            step: 'waiting_pin'
        });

        await bot.sendMessage(chatId, 
            `🔐 KONFIRMASI TRANSAKSI\n\n` +
            `📦 Produk: ${productCode}\n` +
            `📱 Nomor: ${customerNumber}\n\n` +
            `Masukkan PIN Anda untuk melanjutkan:`
        );
    });

    // Handler untuk input PIN transaksi
    bot.on('message', async (msg) => {
        if (!msg.text) return;
        
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const text = msg.text;

        const state = transactionState.get(userId);
        if (state && state.step === 'waiting_pin') {
            await processTransactionWithPIN(bot, chatId, userId, text, state);
        }
    });

    console.log("✅ Transaction system loaded");
};

// ✅ PROSES TRANSAKSI DENGAN PIN
async function processTransactionWithPIN(bot, chatId, userId, pin, state) {
    try {
        const agent = AgentStorage.getAgent(userId);
        if (!agent) {
            transactionState.delete(userId);
            return bot.sendMessage(chatId, '❌ Agent tidak ditemukan.');
        }

        // Verifikasi PIN
        if (agent.pin !== pin) {
            transactionState.delete(userId);
            return bot.sendMessage(chatId, '❌ PIN salah. Transaksi dibatalkan.');
        }

        // PIN benar, proses transaksi
        const processingMsg = await bot.sendMessage(chatId, '🔄 Memproses transaksi...');

        // Simulasi proses transaksi
        setTimeout(async () => {
            try {
                // Update saldo (contoh: kurangi 10000)
                const newBalance = agent.balance - 10000;
                AgentStorage.updateAgent(userId, { balance: newBalance });

                const successMessage = `✅ TRANSAKSI BERHASIL

📦 Produk: ${state.productCode}
📱 Nomor: ${state.customerNumber}
💰 Biaya: Rp 10.000
💳 Saldo: Rp ${newBalance.toLocaleString('id-ID')}
🆔 TrxID: TRX${Date.now()}

Produk akan dikirim dalam 1-5 menit`;

                await bot.editMessageText(successMessage, {
                    chat_id: chatId,
                    message_id: processingMsg.message_id
                });

            } catch (error) {
                console.error('Transaction error:', error);
                await bot.editMessageText('❌ Gagal memproses transaksi.', {
                    chat_id: chatId,
                    message_id: processingMsg.message_id
                });
            }

            transactionState.delete(userId);
        }, 3000);

    } catch (error) {
        console.error('Error in transaction:', error);
        bot.sendMessage(chatId, '❌ Terjadi kesalahan sistem.');
        transactionState.delete(userId);
    }
}