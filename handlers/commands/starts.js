// handlers/commands/start.js
const handleStart = (bot, userStates) => (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  const welcomeMsg = `🤖 **SELAMAT DATANG NGODE**\n\n` +
                      `Halo! Kami siap melayani pembelian:\n` +
                      `• 📱 Pulsa & Paket Data\n` +
                      `• 🎮 Voucher Game\n` +
                      `• 💳 E-Wallet\n` +
                      `• 💡 Token PLN\n\n` +
                      `Pilih menu di bawah:`;
    
    bot.sendMessage(chatId, welcomeMsg, {
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: [
                ['📋 PENDAFTARAN', '💰 DEPOSIT'],
                ['🛒 BELI PULSA', '📦 PAKET DATA', '🎮 GAMES'],
                ['💳 E-WALLET', '💡 PLN', '📊 CEK HARGA'],
                ['💼 CEK SALDO', '👤 PROFIL', '❓ BANTUAN']
            ],
            resize_keyboard: true
        }
    });
});

module.exports = handleStart;


