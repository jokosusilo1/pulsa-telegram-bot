// bot/index.js
const TelegramBot = require('node-telegram-bot-api');
const loadCommands = require('./commands');
const CallbackHandler = require('./handlers/callbackHandler');

// Bot token
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';

// Initialize bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Starting Telegram Bot...');

// Load all commands
loadCommands(bot);

// Register callback handler
CallbackHandler.register(bot);

// Error handling
bot.on('error', (error) => {
    console.error('❌ Bot error:', error);
});

bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error);
});

console.log('✅ Bot is running and ready!');

module.exports = bot;