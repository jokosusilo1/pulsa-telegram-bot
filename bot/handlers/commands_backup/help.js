module.exports = (bot) => {
    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;
        
        const helpMessage = `
🤖 **BOT PULSA - COMMANDS**

📦 **Produk:**
/products - Lihat semua produk
/pulsa - Lihat produk pulsa

🛒 **Pemesanan:**
/order [kode] [nomor] - Pesan produk
Contoh: /order Ax10 08123456789

👤 **Agent:**
/balance - Cek saldo dan statistik
/profile - Info agent
/deposit - Top up saldo

📊 **Laporan:**
Riwayat transaksi tersedia di menu /balance
        `;
        
        bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    });
    
    console.log("✅ Help command registered");
};