// ✅ PATH YANG BENAR - dari commands/ ke services/BotProductService
const BotProductService = require('../services/BotProductService');

console.log("✅ BotProductService loaded successfully");

module.exports = (bot) => {
    bot.onText(/\/pulsa/, async (msg) => {
        const chatId = msg.chat.id;
        
        try {
            const pulsaProducts = await BotProductService.getPulsaProducts();
            
            if (pulsaProducts.length === 0) {
                return bot.sendMessage(chatId, '📭 Tidak ada produk pulsa.');
            }

            let message = '📱 **PRODUK PULSA**\n\n';
            
            // Group by operator
            const operators = {};
            pulsaProducts.forEach(product => {
                if (!operators[product.operator]) {
                    operators[product.operator] = [];
                }
                operators[product.operator].push(product);
            });

            for (const [operator, items] of Object.entries(operators)) {
                message += `**${operator}**\n`;
                items.forEach(product => {
                    message += `• ${product.name} - Rp ${product.price.toLocaleString('id-ID')}\n`;
                    message += `  Kode: \`${product.code}\`\n\n`;
                });
            }

            message += '💡 **Cara Order:**\n';
            message += '`/order [kode] [nomor]`\n';
            message += 'Contoh: `/order AX10 08123456789`';

            bot.sendMessage(chatId, message, { 
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🔄 Refresh", callback_data: "refresh_pulsa" }],
                        [{ text: "📦 Semua Produk", callback_data: "show_all_products" }]
                    ]
                }
            });

        } catch (error) {
            console.error('Error in /pulsa:', error);
            bot.sendMessage(chatId, '❌ Gagal mengambil produk pulsa.');
        }
    });

    // Callback handlers
    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;

        if (data === 'refresh_pulsa') {
            try {
                const pulsaProducts = await BotProductService.getPulsaProducts();
                
                if (pulsaProducts.length === 0) {
                    return bot.answerCallbackQuery(callbackQuery.id, { text: "❌ Tidak ada produk pulsa" });
                }

                let message = '📱 **PRODUK PULSA**\n\n';
                
                const operators = {};
                pulsaProducts.forEach(product => {
                    if (!operators[product.operator]) {
                        operators[product.operator] = [];
                    }
                    operators[product.operator].push(product);
                });

                for (const [operator, items] of Object.entries(operators)) {
                    message += `**${operator}**\n`;
                    items.forEach(product => {
                        message += `• ${product.name} - Rp ${product.price.toLocaleString('id-ID')}\n`;
                        message += `  Kode: \`${product.code}\`\n\n`;
                    });
                }

                bot.editMessageText(message, {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "🔄 Refresh", callback_data: "refresh_pulsa" }],
                            [{ text: "📦 Semua Produk", callback_data: "show_all_products" }]
                        ]
                    }
                });

                bot.answerCallbackQuery(callbackQuery.id, { text: "✅ Produk pulsa diperbarui!" });

            } catch (error) {
                console.error('Error refreshing pulsa:', error);
                bot.answerCallbackQuery(callbackQuery.id, { text: "❌ Gagal refresh" });
            }
        }
        else if (data === 'show_all_products') {
            bot.sendMessage(chatId, '📦 Memuat semua produk...');
        }
    });
    
    console.log("✅ /pulsa command loaded");
};
