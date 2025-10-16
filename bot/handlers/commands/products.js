const apiService = require('../../services/api');

module.exports = async (bot, msg) => {
  const chatId = msg.chat.id;
  
  try {
    const loadingMsg = await bot.sendMessage(chatId, '🔄 Mengambil daftar produk...');
    
    const response = await apiService.getProducts();
    
    if (response.success && response.data.length > 0) {
      let message = '📋 *DAFTAR PRODUK*\n\n';
      
      response.data.slice(0, 8).forEach((product, index) => {
        message += `📦 *${product.name}*\n`;
        message += `💵 Rp ${product.price?.toLocaleString() || '0'}\n`;
        message += `🏷️ ${product.category || 'Umum'}\n`;
        if (index < Math.min(7, response.data.length - 1)) message += '────────────\n';
      });
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown'
      });
    } else {
      await bot.editMessageText('❌ Tidak ada produk ditemukan', {
        chat_id: chatId,
        message_id: loadingMsg.message_id
      });
    }
  } catch (error) {
    await bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
};
