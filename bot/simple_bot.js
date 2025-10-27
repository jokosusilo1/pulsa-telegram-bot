const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

console.log('🤖 Starting Simple Bot Test...');

const bot = new TelegramBot(process.env.BOT_TOKEN, { 
    polling: true 
});

// Simple ping command
bot.onText(/\/start|\/ping/, (msg) => {
    console.log('📩 Received command from:', msg.from.first_name);
    bot.sendMessage(msg.chat.id, '✅ Bot is working! Hello ' + msg.from.first_name);
});

bot.on('message', (msg) => {
    console.log('Message:', msg.text, 'from:', msg.from.first_name);
});

console.log('✅ Bot is running. Test with /start or /ping');
