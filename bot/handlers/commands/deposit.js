module.exports = {
    handleDepositAmount: (bot, msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, '💰 Fitur deposit dalam pengembangan...');
    }
};
