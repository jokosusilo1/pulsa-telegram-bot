module.exports = (bot) => {
    console.log('🔄 Loading report command...');

    bot.onText(/\/report|📊 LAPORAN/, async (msg) => {
        const chatId = msg.chat.id;
        
        const reportMessage = `📊 LAPORAN TRANSAKSI

Fitur laporan transaksi sedang dalam pengembangan.

Untuk melihat riwayat transaksi, hubungi:
📱 08xx-xxxx-xxxx
👨‍💼 @admin_username`;

        bot.sendMessage(chatId, reportMessage);
    });
};