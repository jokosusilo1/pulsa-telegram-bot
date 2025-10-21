const BotProductService = require('../../services/BotProductService');

module.exports = (bot) => {
    bot.onText(/\/products/, async (msg) => {
        const chatId = msg.chat.id;
        
        try {
            const products = await BotProductService.getProductsForBot();
            
            if (products.length === 0) {
                return bot.sendMessage(chatId, '📭 Maaf, tidak ada produk yang tersedia saat ini.');
            }
            
            let message = '📦 **DAFTAR PRODUK**\n\n';
            const categories = {};
            
            // Group by category
            products.forEach(product => {
                if (!categories[product.category]) {
                    categories[product.category] = [];
                }
                categories[product.category].push(product);
            });
            
            // Build message by category
            for (const [category, items] of Object.entries(categories)) {
                message += `**${category.toUpperCase()}**\n`;
                items.slice(0, 5).forEach(product => {
                    message += `• ${product.name} - Rp ${product.price.toLocaleString('id-ID')}\n`;
                });
                if (items.length > 5) {
                    message += `• ... dan ${items.length - 5} produk lainnya\n`;
                }
                message += '\n';
            }
            
            message += 'ℹ️ Gunakan /pulsa untuk lihat produk pulsa spesifik';
            
            bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            
        } catch (error) {
            console.error('Error in /products command:', error);
            bot.sendMessage(chatId, '❌ Gagal mengambil daftar produk.');
        }
    });
    
    console.log("✅ Products command registered");
};