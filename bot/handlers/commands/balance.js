const digiflazz = require('../../config/digiflazz');

module.exports = async (bot, msg) => {
  const chatId = msg.chat.id;
  
  try {
    const loadingMsg = await bot.sendMessage(chatId, '🔄 Mengecek saldo Digiflazz...');
    
    const balance = await digiflazz.checkBalance();
    
    if (balance.success) {
      await bot.editMessageText(
        `💰 *SALDO DIGIFLAZZ*\n\n` +
        `💵 Rp ${balance.balance?.deposit?.toLocaleString() || '0'}\n\n` +
        `_Update: ${new Date().toLocaleTimeString('id-ID')}_`,
        {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
          parse_mode: 'Markdown'
        }
      );
    } else {
      await bot.editMessageText(`❌ Gagal cek saldo: ${balance.error || 'Unknown error'}`, {
        chat_id: chatId,
        message_id: loadingMsg.message_id
      });
    }
  } catch (error) {
    await bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
};
