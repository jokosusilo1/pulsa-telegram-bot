// bot/commands/categories.js
const ApiService = require('../services/ApiService');

module.exports = (bot) => {
    console.log('🔄 Loading categories command...');

    // Handle kategori dari keyboard
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        
        if (msg.text === '📶 PAKET DATA') {
            await showCategoryProducts(bot, chatId, null, 'data');
        }
        else if (msg.text === '⚡ TOKEN PLN') {
            await showCategoryProducts(bot, chatId, null, 'pln');
        }
    });
};

// Export function untuk callback handler
async function showCategoryProducts(bot, chatId, messageId, category) {
    try {
        console.log(`🔄 Loading category: ${category}`);
        
        const result = await ApiService.getProductsByCategory(category);
        
        if (!result.success || !result.data || result.data.length === 0) {
            const message = `📱 <b>PRODUK ${category.toUpperCase()}</b>\n\n🔄 Produk sedang tidak tersedia.`;
            
            if (messageId) {
                await bot.editMessageText(message, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '⬅️ KEMBALI', callback_data: 'back_to_operators' }
                            ]
                        ]
                    }
                });
            } else {
                await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
            }
            return;
        }

        const products = result.data;
        const categoryName = category === 'data' ? 'PAKET DATA' : 'TOKEN PLN';
        
        let message = `<b>📱 DAFTAR ${categoryName}</b>\n\n`;
        
        products.forEach((product, index) => {
            message += `<b>${index + 1}. ${product.name}</b>\n`;
            message += `   💰 <b>Rp ${product.price.toLocaleString('id-ID')}</b>\n`;
            message += `   🆔 Kode: <code>${product.code}</code>\n`;
            message += `   📦 Stok: ${product.stock || 'Unlimited'}\n\n`;
        });

        message += `💡 <b>Cara Order:</b>\n`;
        message += `Ketik: <code>/buy [KODE] [NOMOR]</code>\n`;
        message += `Contoh: <code>/buy ${products[0]?.code || 'KODE'} 08123456789</code>\n\n`;
        message += `🛒 <b>Total: ${products.length} produk</b>`;

        const keyboard = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '⬅️ KEMBALI', callback_data: 'back_to_operators' }
                    ],
                    [
                        { text: '🛒 CARA BELI', callback_data: 'show_buy_menu' }
                    ]
                ]
            }
        };

        if (messageId) {
            await bot.editMessageText(message, {
                chat_id: chatId,
                message_id: messageId,
                ...keyboard
            });
        } else {
            await bot.sendMessage(chatId, message, keyboard);
        }

    } catch (error) {
        console.error(`Error:`, error);
        const errorMessage = `❌ Gagal memuat produk ${category}.`;
        
        if (messageId) {
            await bot.editMessageText(errorMessage, {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '⬅️ KEMBALI', callback_data: 'back_to_operators' }
                        ]
                    ]
                }
            });
        } else {
            await bot.sendMessage(chatId, errorMessage);
        }
    }
}

module.exports.showCategoryProducts = showCategoryProducts;