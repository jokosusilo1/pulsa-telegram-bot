const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

console.log("🤖 Starting Pulsa Telegram Bot...");

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    console.log("❌ ERROR: BOT_TOKEN not set in environment variables");
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🔄 Loading all commands...");

try {
    // Core System
    require('./commands/start')(bot);
    require('./commands/categories')(bot);
    
    // Transaction System
    require('./commands/deposit')(bot);
    require('./commands/transaction')(bot);
    require('./commands/report')(bot);
    
    // Management System
    //require('./commands/admin')(bot);
    require('./commands/notification')(bot);
    
    // Existing commands
    require('./commands/products')(bot);
    require('./commands/pulsa')(bot);
    require('./commands/order')(bot);
    require('./commands/balance')(bot);
    require('./commands/pin')(bot);
    require('./commands/smartOrder')(bot);
    
    
    console.log("✅ ALL SYSTEMS LOADED:");
    console.log("   🎯 Core System ✓");
    console.log("   💰 Transaction System ✓"); 
    console.log("   📊 Management System ✓");
    //console.log("   🔧 Admin Tools ✓");
    // Di bot.js, sebelum loading commands
console.log("🔄 Loading all commands...");
console.log("📦 AgentStorage ready:", !!require('./commands/storage/AgentStorage'));

// Setelah loading commands
console.log(`📊 Total agents registered: ${require('./commands/storage/AgentStorage').getAgentCount()}`);
    
} catch (error) {
    console.error("❌ Error loading commands:", error.message);
}

bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

console.log("🚀 BOT READY FOR PRODUCTION!");
console.log("📧 Support: @admin_username");
console.log("🌐 Version: 2.0.0");