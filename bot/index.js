const TelegramBot = require('node-telegram-bot-api');
const { BOT_TOKEN } = require('./config/constants');
const commandHandlers = require('./handlers/commands');
const messageHandler = require('./handlers/messages/textHandler');
const callbackHandler = require('./handlers/callbacks/callbackHandler');
const { startPolling, stopPolling } = require('./utils/pollingManager');
const { initializeServer } = require('./app/server');

console.log("🤖 Starting Pulsa Telegram Bot - Clean Architecture...");

if (!BOT_TOKEN) {
    console.log("❌ ERROR: BOT_TOKEN not set");
    process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(BOT_TOKEN, {
    polling: { autoStart: false }
});

// Register handlers
commandHandlers.register(bot);
messageHandler.register(bot);
callbackHandler.register(bot);

// Start services
initializeServer(bot);
startPolling(bot);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down gracefully...');
    stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down...');
    stopPolling();
    process.exit(0);
});

console.log("✅ Bot started successfully!");
