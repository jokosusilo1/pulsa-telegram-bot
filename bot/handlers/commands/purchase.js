const UserSession = require('../../services/userSession');
const apiService = require('../../services/api');

class PurchaseHandler {
    static startPurchase(bot, msg) {
        const chatId = msg.chat.id;
        UserSession.setUserState(chatId, 'waiting_purchase_input');
        
        const helpMessage = 
            `🛒 **FORMAT PEMBELIAN CEPAT**\n\n` +
            `Ketik langsung format:\n` +
            `\`[SKU] [NOMOR] [PIN]\`\n\n` +
            `**Contoh:**\n` +
            `• Pulsa: \`5 081234567890 1234\`\n` +
            `• Data: \`axis3 081234567890 1234\`\n` +
            `• PLN: \`pln20 123456789012345 1234\`\n\n` +
            `**Atau** pilih kategori produk:`;

        bot.sendMessage(chatId, helpMessage, {
            parse_mode: 'Markdown',
            reply_markup: {
                keyboard: [
                    ['📞 PULSA', '📶 PAKET DATA'],
                    ['💡 PLN', '💳 E-WALLET'],
                    ['🎮 GAMES', '🚫 BATAL']
                ],
                resize_keyboard: true
            }
        });
    }

    static handlePurchaseInput(bot, msg) {
        const chatId = msg.chat.id;
        const text = msg.text.trim();

        // Handle category selection
        switch (text) {
            case '📞 PULSA':
                this.showPulsaProducts(bot, chatId);
                return;
            case '📶 PAKET DATA':
                this.showDataProducts(bot, chatId);
                return;
            case '💡 PLN':
                this.showPLNProducts(bot, chatId);
                return;
            case '💳 E-WALLET':
                this.showEWalletProducts(bot, chatId);
                return;
            case '🎮 GAMES':
                this.showGameProducts(bot, chatId);
                return;
            case '🚫 BATAL':
                this.cancelPurchase(bot, chatId);
                return;
        }

        // Handle quick format: "[SKU] [NOMOR] [PIN]"
        const parts = text.split(' ');
        if (parts.length === 3) {
            const [sku, targetNumber, pin] = parts;
            
            if (this.validatePurchaseInput(sku, targetNumber, pin)) {
                this.processPurchase(bot, chatId, sku, targetNumber, pin);
            } else {
                bot.sendMessage(chatId, 
                    '❌ Format tidak valid!\n\n' +
                    'Contoh: `5 081234567890 1234`\n' +
                    '• SKU: Kode produk\n' +
                    '• Nomor: Nomor tujuan/ID PLN\n' +
                    '• PIN: 4 digit angka',
                    { parse_mode: 'Markdown' }
                );
            }
            return;
        }

        bot.sendMessage(chatId, 
            '❌ Format tidak dikenali!\n\n' +
            'Gunakan format: `[SKU] [NOMOR] [PIN]`\n' +
            'Atau pilih kategori dari menu.',
            { parse_mode: 'Markdown' }
        );
    }

    static validatePurchaseInput(sku, targetNumber, pin) {
        const validPhone = /^08[0-9]{9,12}$/.test(targetNumber) || /^[0-9]{6,20}$/.test(targetNumber);
        const validPin = /^[0-9]{4}$/.test(pin);
        
        return validPhone && validPin && sku.length >= 1;
    }

    static async processPurchase(bot, chatId, sku, targetNumber, pin) {
        try {
            const loadingMsg = await bot.sendMessage(chatId, '🔄 Memproses pembelian...');

            // 1. Cek produk tersedia via API
            const productCheck = await apiService.getProductBySKU(sku);
            if (!productCheck.success) {
                await bot.editMessageText(
                    `❌ **PRODUK TIDAK DITEMUKAN**\n\n` +
                    `SKU: ${sku}\n` +
                    `Error: ${productCheck.message}`,
                    {
                        chat_id: chatId,
                        message_id: loadingMsg.message_id
                    }
                );
                return;
            }

            // 2. Create order via API
            const orderData = {
                product_sku: sku,
                customer_number: targetNumber,
                pin: pin,
                metadata: {
                    telegram_chat_id: chatId,
                    timestamp: new Date().toISOString()
                }
            };

            const orderResult = await apiService.createOrder(orderData);

            if (orderResult.success) {
                await bot.editMessageText(
                    `✅ **PEMBELIAN BERHASIL!**\n\n` +
                    `📦 Produk: ${orderResult.data.product_name || sku}\n` +
                    `🎯 Tujuan: ${targetNumber}\n` +
                    `💰 Harga: Rp ${orderResult.data.amount?.toLocaleString() || '0'}\n` +
                    `🆔 Order ID: ${orderResult.data.order_id}\n` +
                    `📊 Status: ${orderResult.data.status}\n` +
                    `⏱️ Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
                    `_PIN: ${pin}_`,
                    {
                        chat_id: chatId,
                        message_id: loadingMsg.message_id,
                        parse_mode: 'Markdown'
                    }
                );
            } else {
                await bot.editMessageText(
                    `❌ **PEMBELIAN GAGAL**\n\n` +
                    `SKU: ${sku}\n` +
                    `Tujuan: ${targetNumber}\n\n` +
                    `Error: ${orderResult.message}`,
                    {
                        chat_id: chatId,
                        message_id: loadingMsg.message_id
                    }
                );
            }

        } catch (error) {
            await bot.sendMessage(chatId, `❌ Error: ${error.message}`);
        }
    }

    static async showPulsaProducts(bot, chatId) {
        try {
            const response = await apiService.getProducts();
            
            if (response.success && response.data.length > 0) {
                const pulsaProducts = response.data
                    .filter(p => p.category === 'pulsa')
                    .slice(0, 10);

                let message = '📞 **PULSA**\n\n';
                pulsaProducts.forEach(product => {
                    message += `📱 ${product.name}\n`;
                    message += `💵 Rp ${product.price?.toLocaleString() || '0'}\n`;
                    message += `📝 Format: \`${product.sku} 08xxxxxxxxxx 1234\`\n\n`;
                });

                bot.sendMessage(chatId, message, {
                    parse_mode: 'Markdown',
                    reply_markup: { keyboard: [['🚫 BATAL']], resize_keyboard: true }
                });
            } else {
                bot.sendMessage(chatId, '❌ Tidak ada produk pulsa tersedia', {
                    reply_markup: { keyboard: [['🚫 BATAL']], resize_keyboard: true }
                });
            }
        } catch (error) {
            bot.sendMessage(chatId, '❌ Gagal mengambil data produk');
        }
    }

    // ... (showDataProducts, showPLNProducts, etc. similar pattern)

    static cancelPurchase(bot, chatId) {
        UserSession.setUserState(chatId, 'main_menu');
        bot.sendMessage(chatId, '❌ Pembelian dibatalkan.', {
            reply_markup: {
                keyboard: [
                    ['📊 CEK HARGA', '💳 CEK SALDO'],
                    ['🛒 BELI PULSA', '👤 PROFIL'],
                    ['❓ BANTUAN']
                ],
                resize_keyboard: true
            }
        });
    }
}

module.exports = PurchaseHandler;
