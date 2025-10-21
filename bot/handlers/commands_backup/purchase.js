const BotProductService = require('../../services/BotProductService');

module.exports = (bot) => {
    bot.onText(/\/order (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const params = match[1].split(' ');

        if (params.length < 2) {
            return bot.sendMessage(chatId, 
                '❌ Format salah. Gunakan: /order [kode] [nomor]\nContoh: `/order Ax10 08123456789`',
                { parse_mode: 'Markdown' }
            );
        }

        const productCode = params[0].toUpperCase();
        const customerNumber = params[1];

        // Validasi nomor telepon
        if (!customerNumber.match(/^[0-9]+$/)) {
            return bot.sendMessage(chatId, '❌ Nomor telepon tidak valid. Hanya angka yang diperbolehkan.');
        }

        if (customerNumber.length < 10 || customerNumber.length > 13) {
            return bot.sendMessage(chatId, '❌ Nomor telepon harus 10-13 digit.');
        }

        try {
            // Cari produk
            const product = await BotProductService.findProductForBot(productCode);
            if (!product) {
                return bot.sendMessage(chatId, 
                    `❌ Produk dengan kode "${productCode}" tidak ditemukan.\nGunakan /pulsa untuk melihat daftar kode produk.`
                );
            }

            // Tampilkan konfirmasi order
            const orderMessage = `
📦 **KONFIRMASI PEMESANAN**

📱 Produk: ${product.name}
💰 Harga: Rp ${product.price.toLocaleString('id-ID')}
💸 Komisi: Rp ${product.commission.toLocaleString('id-ID')}
📞 Nomor: ${customerNumber}
👤 Operator: ${product.operator}

Apakah Anda yakin ingin memesan?
            `;

            bot.sendMessage(chatId, orderMessage, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "✅ Ya, Pesan Sekarang", callback_data: `confirm_order_${productCode}_${customerNumber}` },
                            { text: "❌ Batal", callback_data: 'cancel_order' }
                        ]
                    ]
                }
            });

        } catch (error) {
            console.error('Error in /order command:', error);
            bot.sendMessage(chatId, '❌ Gagal memproses pesanan. Silakan coba lagi.');
        }
    });
    
    console.log("✅ Purchase/Order command registered");
};