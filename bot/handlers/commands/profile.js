module.exports = (bot, msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;
    
    const profileMsg = 
        `👤 **PROFIL PENGGUNA**\n\n` +
        `🆔 ID: ${user.id}\n` +
        `📛 Nama: ${user.first_name} ${user.last_name || ''}\n` +
        `🤖 Username: @${user.username || 'Tidak ada'}\n` +
        `📅 Bergabung: ${new Date().toLocaleDateString('id-ID')}`;
    
    bot.sendMessage(chatId, profileMsg, {
        parse_mode: 'Markdown'
    });
};
