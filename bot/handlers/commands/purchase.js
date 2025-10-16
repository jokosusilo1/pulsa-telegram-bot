const UserSession = require('../../services/userSession');
const digiflazz = require('../../config/digiflazz');

class PurchaseHandler {
    static startPurchase(bot, msg) {
        const chatId = msg.chat.id;
        UserSession.setUserState(chatId, 'waiting_purchase_input');
        
        const helpMessage = 
            `🛒 **FORMAT PEMBELIAN CEPAT**\n\n` +
            `Ketik langsung format:\n` +
            `\`5 081234567890 1234\`\n\n` +
            `**Keterangan:**\n` +
            `• 5 = Kode produk (5k)\n` +
            `• 081234567890 = Nomor tujuan\n` +
            `• 1234 = PIN konfirmasi\n\n` +
            `**Atau** gunakan menu interaktif di bawah:`;

        bot.sendMessage(chatId, helpMessage, {
            parse_mode: 'Markdown',
            reply_markup: {
                keyboard: [
                    ['📱 TELKOMSEL', '📱 XL'],
                    ['📱 INDOSAT', '📱 AXIS'],
                    ['🚫 BATAL']
                ],
                resize_keyboard: true
            }
        });
    }

    static handlePurchaseInput(bot, msg) {
        const chatId = msg.chat.id;
        const text = msg.text.trim();

        // Handle menu selection
        if (text === '📱 TELKOMSEL') {
            this.showTelkomselProducts(bot, chatId);
            return;
        }
        if (text === '📱 XL') {
            this.showXLProducts(bot, chatId);
            return;
        }
        if (text === '📱 INDOSAT') {
            this.showIndosatProducts(bot, chatId);
            return;
        }
        if (text === '📱 AXIS') {
            this.showAxisProducts(bot, chatId);
            return;
        }
        if (text === '🚫 BATAL') {
            this.cancelPurchase(bot, chatId);
            return;
        }

        // Handle quick format: "5 081234567890 1234"
        const parts = text.split(' ');
        if (parts.length === 3) {
            const [productCode, phoneNumber, pin] = parts;
            
            if (this.validateQuickPurchase(productCode, phoneNumber, pin)) {
                this.processQuickPurchase(bot, chatId, productCode, phoneNumber, pin);
            } else {
                bot.sendMessage(chatId, 
                    '❌ Format tidak valid!\n\n' +
                    'Contoh: `5 081234567890 1234`\n' +
                    '• Kode: 5, 10, 25, 50, 100\n' +
                    '• Nomor: 08xxxxxxxxxx\n' +
                    '• PIN: 4 digit angka',
                    { parse_mode: 'Markdown' }
                );
            }
            return;
        }

        bot.sendMessage(chatId, 
            '❌ Format tidak dikenali!\n\n' +
            'Gunakan format: `5 081234567890 1234`\n' +
            'Atau pilih operator dari menu.',
            { parse_mode: 'Markdown' }
        );
    }

    static validateQuickPurchase(productCode, phoneNumber, pin) {
        const validCodes = ['5', '10', '25', '50', '100'];
        const validPhone = /^08[0-9]{9,12}$/.test(phoneNumber);
        const validPin = /^[0-9]{4}$/.test(pin);
        
        return validCodes.includes(productCode) && validPhone && validPin;
    }

    static async processQuickPurchase(bot, chatId, productCode, phoneNumber, pin) {
        try {
            const loadingMsg = await bot.sendMessage(chatId, '🔄 Memproses pembelian...');

            // Map product code to Digiflazz product code
            const productMap = {
                '5': 'telkomsel5',    // Contoh kode produk
                '10': 'telkomsel10',
                '25': 'telkomsel25', 
                '50': 'telkomsel50',
                '100': 'telkomsel100'
            };

            const digiflazzCode = productMap[productCode];
            
            if (!digiflazzCode) {
                await bot.editMessageText('❌ Kode produk tidak valid', {
                    chat_id: chatId,
                    message_id: loadingMsg.message_id
                });
                return;
            }

            // Process purchase via Digiflazz
            const result = await digiflazz.purchase(digiflazzCode, phoneNumber);

            if (result.success) {
                await bot.editMessageText(
                    `✅ **PEMBELIAN BERHASIL!**\n\n` +
                    `📦 Produk: Pulsa ${productCode}K\n` +
                    `📱 Tujuan: ${phoneNumber}\n` +
                    `💰 Harga: Rp ${result.data.price}\n` +
                    `🆔 Ref: ${result.data.ref_id}\n` +
                    `📊 Status: ${result.data.status}\n\n` +
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
                    `Error: ${result.error || 'Unknown error'}`,
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

    static showTelkomselProducts(bot, chatId) {
        const products = [
            { code: '5', name: 'Telkomsel 5.000', price: 'Rp 6.000' },
            { code: '10', name: 'Telkomsel 10.000', price: 'Rp 11.000' },
            { code: '25', name: 'Telkomsel 25.000', price: 'Rp 26.000' },
            { code: '50', name: 'Telkomsel 50.000', price: 'Rp 51.000' },
            { code: '100', name: 'Telkomsel 100.000', price: 'Rp 101.000' }
        ];

        let message = '📱 **TELKOMSEL**\n\n';
        products.forEach(product => {
            message += `💰 ${product.name}\n`;
            message += `💵 ${product.price}\n`;
            message += `📝 Format: \`${product.code} 08xxxxxxxxxx 1234\`\n\n`;
        });

        bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                keyboard: [['🚫 BATAL']],
                resize_keyboard: true
            }
        });
    }

    static showXLProducts(bot, chatId) {
        // Similar to showTelkomselProducts but for XL
        bot.sendMessage(chatId, '📱 **XL**\n\nFitur dalam pengembangan...', {
            reply_markup: {
                keyboard: [['🚫 BATAL']],
                resize_keyboard: true
            }
        });
    }

    static showIndosatProducts(bot, chatId) {
        // Similar to showTelkomselProducts but for Indosat
        bot.sendMessage(chatId, '📱 **INDOSAT**\n\nFitur dalam pengembangan...', {
            reply_markup: {
                keyboard: [['🚫 BATAL']],
                resize_keyboard: true
            }
        });
    }

    static showAxisProducts(bot, chatId) {
        // Similar to showTelkomselProducts but for Axis
        bot.sendMessage(chatId, '📱 **AXIS**\n\nFitur dalam pengembangan...', {
            reply_markup: {
                keyboard: [['🚫 BATAL']],
                resize_keyboard: true
            }
        });
    }

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
