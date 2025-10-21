module.exports = (bot) => {
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const welcomeMessage = `
🤖 **BOT PULSA PPOB**

Selamat datang! Saya adalah bot untuk pembelian pulsa dan PPOB.

📋 **Perintah yang tersedia:**
/products - Lihat semua produk
/pulsa - Lihat produk pulsa
/order [kode] [nomor] - Pesan produk
/balance - Cek saldo
/help - Bantuan

🚀 Mulai dengan /products untuk melihat daftar produk!
        `;
        bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    });
    
    console.log("✅ Start command registered");
};