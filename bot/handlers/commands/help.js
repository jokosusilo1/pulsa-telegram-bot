module.exports = (bot, msg) => {
    const chatId = msg.chat.id;
    
    const helpMessage = 
        `❓ *BANTUAN & PANDUAN*\n\n` +
        `*PERINTAH YANG TERSEDIA:*\n` +
        `/start - Memulai bot\n` +
        `/products - Lihat daftar produk\n` +
        `/balance - Cek saldo Digiflazz\n` +
        `/help - Tampilkan bantuan ini\n\n` +
        `*MENU UTAMA:*\n` +
        `📊 CEK HARGA - Lihat harga terbaru\n` +
        `💳 CEK SALDO - Cek saldo Digiflazz\n` +
        `🛒 BELI PULSA - Beli pulsa & paket data\n` +
        `👤 PROFIL - Lihat profil Anda\n\n` +
        `*CARA PENGGUNAAN:*\n` +
        `1. Pilih "Beli Pulsa"\n` +
        `2. Masukkan nomor HP\n` +
        `3. Pilih operator & nominal\n` +
        `4. Konfirmasi pembelian\n\n` +
        `*SUPPORT:*\n` +
        `Hubungi admin untuk bantuan lebih lanjut.`;

    bot.sendMessage(chatId, helpMessage, {
        parse_mode: 'Markdown'
    });
};
