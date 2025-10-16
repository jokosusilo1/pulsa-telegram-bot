module.exports = (bot, msg) => {
  const chatId = msg.chat.id;
  
  const welcomeMessage = 
    `🤖 *Bot Pulsa Telegram*\n\n` +
    `Selamat datang! Saya siap membantu pembelian:\n\n` +
    `📞 Pulsa & Paket Data\n` +
    `💳 E-Wallet & Voucher\n` +
    `💡 Token Listrik PLN\n` +
    `🎮 Voucher Games\n\n` +
    `**Format Cepat:**\n` +
    `\`[SKU] [NOMOR] [PIN]\`\n\n` +
    `Contoh: \`5 081234567890 1234\``;

  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: [
        ['📊 CEK HARGA', '💳 CEK SALDO'],
        ['🛒 BELI PULSA', '👤 PROFIL'],
        ['❓ BANTUAN']
      ],
      resize_keyboard: true
    }
  });
};
