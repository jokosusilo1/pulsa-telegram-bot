const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

console.log("🤖 Starting Pulsa Telegram Bot...");

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    console.log("❌ ERROR: BOT_TOKEN not set");
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Load commands satu per satu untuk cari yang error
console.log("🔄 Loading commands one by one...");

try {
    console.log("1. Loading start...");
    require('./commands/start')(bot);
    console.log("✅ start loaded");
} catch (error) {
    console.log("❌ start ERROR:", error.message);
}

try {
    console.log("2. Loading products...");
    require('./commands/products')(bot);
    console.log("✅ products loaded");
} catch (error) {
    console.log("❌ products ERROR:", error.message);
}

try {
    console.log("3. Loading pulsa...");
    require('./commands/pulsa')(bot);
    console.log("✅ pulsa loaded");
} catch (error) {
    console.log("❌ pulsa ERROR:", error.message);
}

try {
    console.log("4. Loading order...");
    require('./commands/order')(bot);
    console.log("✅ order loaded");
} catch (error) {
    console.log("❌ order ERROR:", error.message);
}

try {
    console.log("5. Loading balance...");
    require('./commands/balance')(bot);
    console.log("✅ balance loaded");
} catch (error) {
    console.log("❌ balance ERROR:", error.message);
}

bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

console.log("✅ Bot started successfully!");