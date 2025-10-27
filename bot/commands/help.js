
module.exports = (bot) => {
    console.log('🔄 Loading help command...');

    bot.onText(/\/help|📞 BANTUAN/, async (msg) => {
        const chatId = msg.chat.id;
        
        const helpMessage = `📞 BANTUAN

🤖 CARA PENGGUNAAN:
1. Klik "📱 BELI PULSA/DATA"
2. Pilih operator atau kategori
3. Lihat daftar harga
4. Untuk order: /buy KODE NOMOR

📋 CONTOH:
<code>/buy P5 08123456789</code>
<code>/buy D1 08123456789</code>
<code>/buy PLN20 123456789012</code>

💡 Kode produk bisa dilihat di daftar harga.

📞 KONTAK ADMIN:
@admin_username
📱 08xx-xxxx-xxxx`;

        bot.sendMessage(chatId, helpMessage, { parse_mode: 'HTML' });
    });

    // Handle help button
    bot.on('message', async (msg) => {
        if (msg.text === '📞 BANTUAN') {
            const chatId = msg.chat.id;
            
            const helpMessage = `📞 BANTUAN DAN INFORMASI

ℹ️ INFO BISNIS:
• Sistem kerja PPOB
• Cara deposit saldo
• Cara melakukan transaksi

📞 KONTAK SUPPORT:
Admin: @admin_username
WhatsApp: 08xx-xxxx-xxxx

⏰ WAKTU OPERASIONAL:
24 Jam / 7 Hari`;

            bot.sendMessage(chatId, helpMessage);
        }
    });
};