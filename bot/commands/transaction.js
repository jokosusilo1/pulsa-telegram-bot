// bot/commands/transaction.js
const ApiService = require('../services/ApiService');

module.exports = (bot) => {
    console.log('🔄 Loading transaction command...');

    bot.onText(/\/buy (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const params = match[1].split(' ');
        
        if (params.length < 2) {
            return bot.sendMessage(chatId, 
                '❌ Format salah.\n\n' +
                '💡 <b>Format yang benar:</b>\n' +
                '<code>/buy [KODE] [NOMOR]</code>\n\n' +
                '📋 <b>Contoh:</b>\n' +
                '<code>/buy P5 08123456789</code>\n' +
                '<code>/buy D1 08123456789</code>\n' +
                '<code>/buy PLN20 123456789012</code>',
                { parse_mode: 'HTML' }
            );
        }

        const productCode = params[0];
        const targetNumber = params[1];

        // Validasi nomor
        if (!isValidPhoneNumber(targetNumber) && !isValidPLNNumber(targetNumber)) {
            return bot.sendMessage(chatId,
                '❌ Format nomor tidak valid.\n\n' +
                '📱 <b>Nomor HP:</b> 10-13 digit\n' +
                '⚡ <b>Token PLN:</b> 11-12 digit\n\n' +
                'Contoh:\n' +
                '<code>/buy P5 08123456789</code>\n' +
                '<code>/buy PLN20 123456789012</code>',
                { parse_mode: 'HTML' }
            );
        }

        try {
            // Cek produk
            const productResult = await ApiService.getProductByCode(productCode);
            
            if (!productResult.success) {
                return bot.sendMessage(chatId,
                    `❌ Produk dengan kode <code>${productCode}</code> tidak ditemukan.\n\n` +
                    '💡 Gunakan /products untuk melihat daftar produk dan kodenya.',
                    { parse_mode: 'HTML' }
                );
            }

            const product = productResult.data;
            
            // Tampilkan konfirmasi
            const confirmMessage = `🛒 KONFIRMASI ORDER

📦 Produk: ${product.name}
💰 Harga: Rp ${product.price.toLocaleString('id-ID')}
📱 Tujuan: ${targetNumber}

✅ Ketik <code>/confirm ${productCode} ${targetNumber}</code> untuk melanjutkan
❌ Ketik /cancel untuk membatalkan`;

            bot.sendMessage(chatId, confirmMessage, { parse_mode: 'HTML' });

        } catch (error) {
            console.error('Error checking product:', error);
            bot.sendMessage(chatId, '❌ Gagal memeriksa produk. Silakan coba lagi.');
        }
    });

    // Handle confirm command
    bot.onText(/\/confirm (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const params = match[1].split(' ');
        
        if (params.length < 2) {
            return bot.sendMessage(chatId, '❌ Format konfirmasi salah.');
        }

        const productCode = params[0];
        const targetNumber = params[1];

        // Proses transaksi
        bot.sendMessage(chatId,
            `🔄 MEMPROSES TRANSAKSI...\n\n` +
            `📦 Kode: ${productCode}\n` +
            `📱 Tujuan: ${targetNumber}\n\n` +
            `⏳ Mohon tunggu...`
        );

        // Simulasi proses
        setTimeout(() => {
            bot.sendMessage(chatId,
                `✅ TRANSAKSI BERHASIL!\n\n` +
                `📦 Produk: ${productCode}\n` +
                `📱 Tujuan: ${targetNumber}\n` +
                `💰 Total: Rp 0 (demo)\n\n` +
                `📝 Status: Sukses\n` +
                `🆔 Ref: DEMO-${Date.now()}\n\n` +
                `💡 Ini hanya demo. Fitur transaksi real sedang dalam pengembangan.`
            );
        }, 2000);
    });

    // Handle cancel command
    bot.onText(/\/cancel/, async (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, '❌ Transaksi dibatalkan.');
    });
};

// Helper functions
function isValidPhoneNumber(number) {
    const phoneRegex = /^[0-9]{10,13}$/;
    return phoneRegex.test(number);
}

function isValidPLNNumber(number) {
    const plnRegex = /^[0-9]{11,12}$/;
    return plnRegex.test(number);
}