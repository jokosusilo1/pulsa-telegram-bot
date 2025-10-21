
const BotProductService = require('../services/BotProductService');

module.exports = (bot) => {
    bot.onText(/\/products/, async (msg) => {
        const chatId = msg.chat.id;
        
        try {
            const products = await BotProductService.getProductsForBot();
            
            if (products.length === 0) {
                return bot.sendMessage(chatId, '📭 Tidak ada produk yang tersedia.');
            }

            // Group by category
            const categories = {};
            products.forEach(product => {
                if (!categories[product.category]) {
                    categories[product.category] = [];
                }
                categories[product.category].push(product);
            });

            let message = '📦 **DAFTAR PRODUK**\n\n';
            
            for (const [category, items] of Object.entries(categories)) {
                message += `**${category.toUpperCase()}**\n`;
                items.slice(0, 8).forEach(product => {
                    message += `• ${product.name} - Rp ${product.price.toLocaleString('id-ID')}\n`;
                    message += `  Kode: \`${product.code}\`\n\n`;
                });
                if (items.length > 8) {
                    message += `• ... dan ${items.length - 8} produk lainnya\n\n`;
                }
            }

            message += '💡 **Cara Order:**\n';
            message += '`/order [kode] [nomor]`\n';
            message += 'Contoh: `/order Ax10 08123456789`';

            bot.sendMessage(chatId, message, { 
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🔄 Refresh Produk", callback_data: "refresh_products" }]
                    ]
                }
            });

        } catch (error) {
            console.error('Error in /products:', error);
            bot.sendMessage(chatId, '❌ Gagal mengambil daftar produk.');
        }
    });

    // Refresh products callback
    bot.on('callback_query', async (callbackQuery) => {
        if (callbackQuery.data === 'refresh_products') {
            const msg = callbackQuery.message;
            const chatId = msg.chat.id;
            
            try {
                const products = await BotProductService.getProductsForBot();
                
                if (products.length === 0) {
                    return bot.answerCallbackQuery(callbackQuery.id, { text: "❌ Tidak ada produk" });
                }

                const categories = {};
                products.forEach(product => {
                    if (!categories[product.category]) {
                        categories[product.category] = [];
                    }
                    categories[product.category].push(product);
                });

                let message = '📦 **DAFTAR PRODUK**\n\n';
                
                for (const [category, items] of Object.entries(categories)) {
                    message += `**${category.toUpperCase()}**\n`;
                    items.slice(0, 8).forEach(product => {
                        message += `• ${product.name} - Rp ${product.price.toLocaleString('id-ID')}\n`;
                        message += `  Kode: \`${product.code}\`\n\n`;
                    });
                    if (items.length > 8) {
                        message += `• ... dan ${items.length - 8} produk lainnya\n\n`;
                    }
                }

                bot.editMessageText(message, {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "🔄 Refresh Produk", callback_data: "refresh_products" }]
                        ]
                    }
                });

                bot.answerCallbackQuery(callbackQuery.id, { text: "✅ Produk diperbarui!" });

            } catch (error) {
                console.error('Error refreshing products:', error);
                bot.answerCallbackQuery(callbackQuery.id, { text: "❌ Gagal refresh" });
            }
        }
    });
    
    console.log("✅ /products command loaded");
};
