const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

console.log('🔧 Testing Bot Token...');
console.log('Token:', process.env.BOT_TOKEN ? '***' + process.env.BOT_TOKEN.slice(-6) : 'MISSING');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

bot.getMe()
    .then(botInfo => {
        console.log('✅ BOT TOKEN VALID');
        console.log('   Bot Username:', botInfo.username);
        console.log('   Bot Name:', botInfo.first_name);
        console.log('   Can Join Groups:', botInfo.can_join_groups);
        console.log('   Can Read Messages:', botInfo.can_read_all_group_messages);
        
        // Test send message
        console.log('📤 Testing message send...');
        return bot.sendMessage(process.env.DEVELOPER_CHAT_ID || botInfo.id, '🤖 Bot test successful!');
    })
    .then(() => {
        console.log('✅ Message sent successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ BOT TOKEN INVALID:', error.message);
        console.log('💡 Solutions:');
        console.log('   1. Check BOT_TOKEN in .env file');
        console.log('   2. Make sure bot is created with @BotFather');
        console.log('   3. Bot might be disabled');
        process.exit(1);
    });
