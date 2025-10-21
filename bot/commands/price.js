

const BotProductService = require('../services/BotProductService');

module.exports = (bot) => {
    console.log("🔄 Loading price check commands...");

    // Command /harga
    bot.onText(/\/harga/, async (msg) => {
        const chatId = msg.chat.id;
        await showPriceMainMenu(bot, chatId);
    });

    // Command /harga [operator]
    bot.onText(/\/harga (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const operator = match[1].toUpperCase();
        
        try {
            await showOperatorPriceList(bot, chatId, operator);
        } catch (error) {
            console.error('Error in /harga command:', error);
            bot.sendMessage(chatId, '❌ Gagal mengambil daftar harga.');
        }
    });

    // Handler untuk tombol CEK HARGA
    bot.on('message', async (msg) => {
        if (!msg.text) return;
        
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text === '💰 CEK HARGA') {
            await showPriceMainMenu(bot, chatId);
        }
    });

    // Handler untuk callback queries (inline buttons)
    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;

        try {
            if (data.startsWith('price_operator_')) {
                const operator = data.replace('price_operator_', '');
                await showOperatorPriceList(bot, chatId, operator);
            }
            else if (data.startsWith('price_detail_')) {
                const operator = data.replace('price_detail_', '');
                await showDetailedPriceList(bot, chatId, operator);
            }
            else if (data === 'price_back_main') {
                await showPriceMainMenu(bot, chatId);
            }

            bot.answerCallbackQuery(callbackQuery.id);
        } catch (error) {
            console.error('Error in price callback:', error);
            bot.answerCallbackQuery(callbackQuery.id, { text: "❌ Terjadi kesalahan" });
        }
    });

    console.log("✅ Price check commands loaded");
};

// ✅ MENU UTAMA CEK HARGA
async function showPriceMainMenu(bot, chatId) {
    const message = `💰 **CEK HARGA PRODUK**

Pilih operator untuk melihat daftar harga lengkap:`;

    const operators = await BotProductService.getAllOperators();
    
    const keyboard = {
        inline_keyboard: []
    };

    // Buat tombol operator (2 per baris)
    for (let i = 0; i < operators.length; i += 2) {
        const row = operators.slice(i, i + 2).map(operator => ({
            text: `📱 ${operator}`,
            callback_data: `price_operator_${operator}`
        }));
        keyboard.inline_keyboard.push(row);
    }

    // Tambahkan tombol semua operator
    keyboard.inline_keyboard.push([
        { text: "📊 SEMUA OPERATOR", callback_data: "price_detail_ALL" }
    ]);

    await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

// ✅ DAFTAR HARGA PER OPERATOR
async function showOperatorPriceList(bot, chatId, operator) {
    try {
        const products = await BotProductService.getPriceListByOperator(operator);
        
        if (products.length === 0) {
            return bot.sendMessage(chatId, 
                `❌ Tidak ada produk untuk operator ${operator}\n\n` +
                `Silakan coba operator lain.`
            );
        }

        // Kelompokkan produk berdasarkan range harga
        const lowRange = products.filter(p => p.price <= 25000);
        const midRange = products.filter(p => p.price > 25000 && p.price <= 100000);
        const highRange = products.filter(p => p.price > 100000);

        let message = `💰 **HARGA ${operator}**\n\n`;

        // Tampilkan low range (1k - 25k)
        if (lowRange.length > 0) {
            message += `📱 **PULSA REGULER**\n`;
            lowRange.forEach(product => {
                message += `• ${product.name}: Rp ${product.price.toLocaleString('id-ID')}\n`;
            });
            message += `\n`;
        }

        // Tampilkan mid range (25k - 100k)
        if (midRange.length > 0) {
            message += `💎 **PULSA MENENGAH**\n`;
            midRange.forEach(product => {
                message += `• ${product.name}: Rp ${product.price.toLocaleString('id-ID')}\n`;
            });
            message += `\n`;
        }

        // Tampilkan high range (100k+)
        if (highRange.length > 0) {
            message += `🚀 **PULSA BESAR**\n`;
            highRange.forEach(product => {
                message += `• ${product.name}: Rp ${product.price.toLocaleString('id-ID')}\n`;
            });
            message += `\n`;
        }

        message += `📊 **Total Produk:** ${products.length} item\n`;
        message += `💡 **Harga dapat berubah tanpa pemberitahuan**`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: "📋 DETAIL LENGKAP", callback_data: `price_detail_${operator}` },
                    { text: "🛍️ BELI SEKARANG", callback_data: `category_pulsa` }
                ],
                [
                    { text: "⬅️ KEMBALI", callback_data: "price_back_main" }
                ]
            ]
        };

        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });

    } catch (error) {
        console.error('Error showing price list:', error);
        bot.sendMessage(chatId, '❌ Gagal mengambil daftar harga.');
    }
}

// ✅ DETAIL HARGA LENGKAP DENGAN FORMAT TABEL
async function showDetailedPriceList(bot, chatId, operator) {
    try {
        let products = [];
        let title = "";

        if (operator === 'ALL') {
            // Ambil semua produk dari semua operator
            const allOperators = await BotProductService.getAllOperators();
            for (const op of allOperators) {
                const opProducts = await BotProductService.getPriceListByOperator(op);
                products.push(...opProducts);
            }
            title = "📊 **DAFTAR HARGA SEMUA OPERATOR**";
        } else {
            // Ambil produk untuk operator tertentu
            products = await BotProductService.getPriceListByOperator(operator);
            title = `📊 **DAFTAR HARGA ${operator} LENGKAP**`;
        }

        if (products.length === 0) {
            return bot.sendMessage(chatId, '❌ Tidak ada data harga.');
        }

        // Urutkan by operator dan price
        products.sort((a, b) => {
            if (a.operator !== b.operator) {
                return a.operator.localeCompare(b.operator);
            }
            return a.price - b.price;
        });

        let message = `${title}\n\n`;
        
        let currentOperator = '';
        products.forEach(product => {
            if (product.operator !== currentOperator) {
                currentOperator = product.operator;
                message += `\n📱 **${currentOperator}**\n`;
            }
            
            const priceFormatted = product.price.toLocaleString('id-ID').padStart(8, ' ');
            const nameFormatted = product.name.padEnd(15, ' ');
            
            message += `${nameFormatted} : Rp ${priceFormatted}\n`;
        });

        message += `\n📈 **Total:** ${products.length} produk\n`;
        message += `⏰ **Update:** ${new Date().toLocaleDateString('id-ID')}`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: "🔄 REFRESH", callback_data: `price_detail_${operator}` },
                    { text: "📱 PER OPERATOR", callback_data: "price_back_main" }
                ],
                [
                    { text: "🛍️ BELI PRODUK", callback_data: "category_pulsa" }
                ]
            ]
        };

        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });

    } catch (error) {
        console.error('Error showing detailed price:', error);
        bot.sendMessage(chatId, '❌ Gagal mengambil detail harga.');
    }
}

// ✅ CEK HARGA SPESIFIK
async function showSpecificPrice(bot, chatId, productCode) {
    try {
        const product = await BotProductService.findProductForBot(productCode);
        
        if (!product) {
            return bot.sendMessage(chatId, '❌ Produk tidak ditemukan.');
        }

        const message = `💰 **DETAIL HARGA**

🏷️ **Produk:** ${product.name}
📱 **Operator:** ${product.operator}
💰 **Harga:** Rp ${product.price.toLocaleString('id-ID')}
🆔 **Kode:** \`${product.code}\`

💡 **Cara Order:**
\`/order ${product.code} [nomor_tujuan]\`

Contoh:
\`/order ${product.code} 08123456789\``;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: "📱 HARGA ${product.operator}", callback_data: `price_operator_${product.operator}` },
                    { text: "🛒 ORDER", callback_data: `order_${product.code}` }
                ]
            ]
        };

        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });

    } catch (error) {
        console.error('Error showing specific price:', error);
        bot.sendMessage(chatId, '❌ Gagal mengambil harga produk.');
    }
}