module.exports = (bot) => {
    console.log('🔄 Loading pin command...');

    bot.onText(/\/pin|🔐 GANTI PIN/, async (msg) => {
        const chatId = msg.chat.id;
        
        const pinMessage = `🔐 GANTI PIN

Fitur ganti PIN sedang dalam pengembangan.

Untuk sementara, hubungi admin untuk reset PIN:
📱 08xx-xxxx-xxxx
👨‍💼 @admin_username`;

        bot.sendMessage(chatId, pinMessage);
    });
};