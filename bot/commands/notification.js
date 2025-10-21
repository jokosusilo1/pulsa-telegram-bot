
const agentStorage = new Map();

module.exports = (bot) => {
    console.log("🔄 Loading notification system...");

    // Command /notif
    bot.onText(/\/notif/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        try {
            const agent = agentStorage.get(userId);
            if (!agent) return;

            await showNotificationSettings(bot, chatId, agent);
        } catch (error) {
            console.error('Error in /notif:', error);
        }
    });

    console.log("✅ Notification system loaded");
};

async function showNotificationSettings(bot, chatId, agent) {
    const message = `🔔 **PENGATURAN NOTIFIKASI**

Atur notifikasi yang Anda inginkan:

✅ **Notifikasi Transaksi** - Info setiap transaksi
✅ **Notifikasi Saldo** - Update perubahan saldo  
✅ **Notifikasi Promo** - Info promo dan bonus
✅ **Notifikasi Sistem** - Update sistem dan maintenance

*Notifikasi membantu Anda tetap update dengan aktivitas akun*`;

    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "✅ Transaksi", callback_data: "notif_transaction" },
                    { text: "✅ Saldo", callback_data: "notif_balance" }
                ],
                [
                    { text: "✅ Promo", callback_data: "notif_promo" },
                    { text: "✅ Sistem", callback_data: "notif_system" }
                ],
                [
                    { text: "💾 SIMPAN", callback_data: "notif_save" }
                ]
            ]
        }
    };

    await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}
