module.exports = (bot) => {
    bot.onText(/\/deposit/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, '💰 Fitur deposit sedang dalam pengembangan...');
    });
    
    console.log("✅ Deposit command registered");
};