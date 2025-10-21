module.exports = (bot) => {
    bot.onText(/\/profile/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, '👤 Fitur profile sedang dalam pengembangan...');
    });
    
    console.log("✅ Profile command registered");
};