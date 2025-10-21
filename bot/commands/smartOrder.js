// commands/smartOrder.js
const BotProductService = require('../services/BotProductService');
const AgentStorage = require('./storage/AgentStorage');

// ✅ VARIABEL UNTUK MENYIMPAN ORDER SEMENTARA
const pendingOrders = {};

// ✅ FUNGSI DETEKSI OPERATOR BERDASARKAN NOMOR
function detectOperator(phoneNumber) {
    // Normalisasi nomor
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Prefix per operator
    const prefixes = {
        'telkomsel': ['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'],
        'indosat': ['0814', '0815', '0816', '0855', '0856', '0857', '0858'],
        'xl': ['0817', '0818', '0819', '0859', '0877', '0878'],
        'axis': ['0831', '0832', '0833', '0838'],
        'smartfren': ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888'],
        'tri': ['0895', '0896', '0897', '0898', '0899']
    };

    const prefix4 = cleanNumber.substring(0, 4);
    const prefix3 = cleanNumber.substring(0, 3);

    for (const [operator, operatorPrefixes] of Object.entries(prefixes)) {
        if (operatorPrefixes.includes(prefix4) || operatorPrefixes.includes(prefix3)) {
            return operator;
        }
    }

    return 'unknown';
}

// ✅ FUNGSI CARI PRODUK OTOMATIS
async function findProductByNominalAndOperator(nominal, operator) {
    try {
        const allProducts = await BotProductService.getPulsaProducts();
        
        // Konversi nominal user ke format angka (10 -> 10000, 25 -> 25000)
        const targetPrice = nominal * 1000;
        
        // Cari produk yang match
        const matchedProducts = allProducts.filter(product => 
            product.operator && 
            product.operator.toLowerCase() === operator.toLowerCase() &&
            product.price === targetPrice
        );

        return matchedProducts.length > 0 ? matchedProducts[0] : null;
    } catch (error) {
        console.error('Error finding product:', error);
        return null;
    }
}

// ✅ PROSES ORDER OTOMATIS
async function processAutoOrder(bot, chatId, userId, product, phoneNumber) {
    try {
        // Cek saldo agent
        const agent = AgentStorage.getAgent(userId);
        if (!agent) {
            return bot.sendMessage(chatId, '❌ Anda belum terdaftar sebagai agent.');
        }

        if (agent.balance < product.price) {
            return bot.sendMessage(chatId, 
                `❌ Saldo tidak cukup!\n\n💳 Saldo Anda: Rp ${agent.balance.toLocaleString('id-ID')}\n💰 Harga produk: Rp ${product.price.toLocaleString('id-ID')}\n\nSilakan deposit terlebih dahulu.`);
        }

        // Tampilkan konfirmasi order
        const message = `✅ *PRODUK DITEMUKAN OTOMATIS!*

📦 *Produk:* ${product.name.replace(/\./g, ',')}
🏢 *Operator:* ${product.operator.toUpperCase()}
💰 *Harga:* Rp ${product.price.toLocaleString('id-ID')}
📱 *Nomor Tujuan:* ${phoneNumber}
🆔 *Kode Produk:* ${product.code}

💡 *Konfirmasi Order:*
Ketik *YA* untuk melanjutkan
Ketik *TIDAK* untuk membatalkan`;

        await bot.sendMessage(chatId, message, { 
            parse_mode: 'Markdown',
            reply_markup: {
                keyboard: [
                    ["YA", "TIDAK"]
                ],
                resize_keyboard: true
            }
        });

        // Simpan data order sementara
        pendingOrders[userId] = {
            product,
            phoneNumber,
            timestamp: Date.now()
        };

    } catch (error) {
        console.error('Error in auto order:', error);
        bot.sendMessage(chatId, '❌ Gagal memproses order otomatis.');
    }
}

// ✅ EKSEKUSI ORDER SETELAH KONFIRMASI
async function executeOrder(bot, chatId, userId, product, phoneNumber) {
    try {
        // Kurangi saldo agent
        const agent = AgentStorage.getAgent(userId);
        agent.balance -= product.price;
        AgentStorage.updateAgent(userId, agent);

        // TODO: Tambahkan logika proses order sebenarnya di sini
        // Misalnya: kirim ke API provider, simpan transaksi, dll.

        // Kirim pesan sukses
        await bot.sendMessage(chatId, 
            `✅ *Order Berhasil!*

📦 *Produk:* ${product.name.replace(/\./g, ',')}
🏢 *Operator:* ${product.operator.toUpperCase()}
💰 *Harga:* Rp ${product.price.toLocaleString('id-ID')}
📱 *Nomor Tujuan:* ${phoneNumber}
🆔 *Kode Produk:* ${product.code}

💳 *Sisa Saldo:* Rp ${agent.balance.toLocaleString('id-ID')}

Terima kasih telah berbelanja!`, {
            parse_mode: 'Markdown',
            reply_markup: { remove_keyboard: true }
        });

    } catch (error) {
        console.error('Error executing order:', error);
        bot.sendMessage(chatId, '❌ Gagal mengeksekusi order.');
    }
}

module.exports = (bot) => {
    console.log("🔄 Loading smart order system...");

    // ✅ HANDLER UNTUK SMART ORDER
    bot.onText(/^(\d+)\s+(\d+)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const nominal = parseInt(match[1]);
        const phoneNumber = match[2];

        console.log(`🔍 Smart order detected: ${nominal} ${phoneNumber}`);

        try {
            // Deteksi operator
            const operator = detectOperator(phoneNumber);
            
            if (operator === 'unknown') {
                return bot.sendMessage(chatId, 
                    `❌ Tidak bisa mendeteksi operator dari nomor ${phoneNumber}.\n\nSilakan gunakan format:\nKODE NOMOR\nContoh: AX10 083879725433`);
            }

            // Cari produk otomatis
            const product = await findProductByNominalAndOperator(nominal, operator);
            
            if (!product) {
                return bot.sendMessage(chatId, 
                    `❌ Produk ${nominal}.000 untuk ${operator.toUpperCase()} tidak ditemukan.\n\nGunakan format dengan kode:\nKODE NOMOR`);
            }

            // Jalankan order otomatis
            await processAutoOrder(bot, chatId, userId, product, phoneNumber);

        } catch (error) {
            console.error('Error in smart order:', error);
            bot.sendMessage(chatId, '❌ Gagal memproses order otomatis.');
        }
    });

    // ✅ HANDLER KONFIRMASI ORDER (YA/TIDAK)
    bot.on('message', async (msg) => {
        if (!msg.text) return;
        
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const text = msg.text.toUpperCase();

        // Handler konfirmasi order
        if (pendingOrders[userId] && (text === 'YA' || text === 'TIDAK')) {
            const orderData = pendingOrders[userId];
            
            if (text === 'YA') {
                // Proses order
                await executeOrder(bot, chatId, userId, orderData.product, orderData.phoneNumber);
            } else {
                await bot.sendMessage(chatId, '❌ Order dibatalkan.', {
                    reply_markup: { remove_keyboard: true }
                });
            }
            
            // Hapus pending order
            delete pendingOrders[userId];
        }
    });

    console.log("✅ Smart order system loaded");
};
