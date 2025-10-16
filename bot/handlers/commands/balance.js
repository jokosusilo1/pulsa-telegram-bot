const apiService = require('../../services/api');

module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
    
    try {
        const loadingMsg = await bot.sendMessage(chatId, '🔄 Mengecek saldo...');
        
        const balance = await apiService.getBalance();
        
        if (balance.success) {
            await bot.editMessageText(
                `💰 **SALDO SISTEM**\n\n` +
                `💵 Rp ${balance.data?.balance?.toLocaleString() || '0'}\n\n` +
                `_Update: ${new Date().toLocaleTimeString('id-ID')}_`,
                {
                    chat_id: chatId,
                    message_id: loadingMsg.message_id,
                    parse_mode: 'Markdown'
                }
            );
        } else {
            await bot.editMessageText(`❌ Gagal cek saldo: ${balance.message}`, {
                chat_id: chatId,
                message_id: loadingMsg.message_id
            });
        }
    } catch (error) {
        await bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
};
