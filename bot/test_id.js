
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

console.log('🤖 Bot is listening...');
console.log('💬 Send a message to @Alifpay_bot to get your Chat ID');

bot.on('message', (msg) => {
    console.log('='.repeat(50));
    console.log('✅ YOUR CHAT ID FOUND!');
    console.log('   Chat ID:', msg.chat.id);
    console.log('   Your Name:', msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : ''));
    console.log('   Username:', '@' + (msg.from.username || 'no-username'));
    console.log('='.repeat(50));
    
    bot.sendMessage(msg.chat.id, 
        `✅ Chat ID Anda: ${msg.chat.id}\n` +
        `Simpan ini di file .env sebagai DEVELOPER_CHAT_ID`
    ).then(() => {
        console.log('📩 Check Telegram - I sent you your Chat ID!');
        process.exit(0);
    });
});
"
