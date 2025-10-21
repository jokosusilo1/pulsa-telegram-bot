const BotProductService = require('../services/BotProductService');

// ✅ FUNGSI UNTUK MEMFORMAT NAMA PRODUK
function formatProductName(name) {
    if (typeof name !== 'string') return name;
    
    // Ganti titik dengan koma (10.000 -> 10,000)
    return name.replace(/\./g, ',');
}

module.exports = (bot) => {
    console.log("🔄 Loading categories command...");

    // Command /beli
    bot.onText(/\/beli/, async (msg) => {
        const chatId = msg.chat.id;
        showMainCategories(bot, chatId);
    });

    // Handler untuk tombol BELI
    bot.on('message', async (msg) => {
        if (!msg.text) return;
        
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text === '📱 BELI PULSA/DATA') {
            showMainCategories(bot, chatId);
        }
    });

    // Handler untuk callback queries (inline buttons) - ✅ DIPERBAIKI
    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const messageId = msg.message_id;
        const data = callbackQuery.data;

        // ✅ JAWAB SEGERA untuk mencegah timeout
        await bot.answerCallbackQuery(callbackQuery.id, { text: "⏳ Memuat..." });

        try {
            if (data.startsWith('category_')) {
                const category = data.replace('category_', '');
                await showSubCategories(bot, chatId, messageId, category);
            }
            else if (data.startsWith('subcategory_')) {
                const parts = data.replace('subcategory_', '').split('_');
                const category = parts[0];
                const subcategory = parts[1];
                
                console.log(`🔍 Memproses subcategory: ${category} - ${subcategory}`);
                await showProducts(bot, chatId, messageId, category, subcategory);
            }
            else if (data.startsWith('product_')) {
                const productCode = data.replace('product_', '');
                await showProductDetail(bot, chatId, productCode);
            }
            else if (data === 'back_to_categories') {
                await showMainCategories(bot, chatId);
            }

        } catch (error) {
            console.error('Error in callback query:', error);
            
            // ✅ ERROR HANDLING YANG LEBIH BAIK
            if (error.message && error.message.includes('query is too old')) {
                await bot.sendMessage(chatId, "❌ Sesi telah kadaluarsa. Silakan klik menu lagi.");
            } else {
                await bot.answerCallbackQuery(callbackQuery.id, { text: "❌ Terjadi kesalahan" });
            }
        }
    }); // ✅ TAMBAHKAN KURUNG TUTUP INI

    console.log("✅ Categories command loaded");

    // ✅ TAMPILKAN KATEGORI UTAMA
    function showMainCategories(bot, chatId) {
        const message = `🛍️ **PILIH KATEGORI**

Silakan pilih kategori produk yang Anda butuhkan:`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: "📱 PULSA", callback_data: "category_pulsa" },
                    { text: "⚡ PLN", callback_data: "category_pln" }
                ],
                [
                    { text: "🎮 GAME", callback_data: "category_game" },
                    { text: "📦 PAKET DATA", callback_data: "category_data" }
                ],
                [
                    { text: "💳 E-WALLET", callback_data: "category_ewallet" },
                    { text: "📺 TV & INTERNET", callback_data: "category_tv" }
                ],
                [
                    { text: "🏠 MENU UTAMA", callback_data: "back_to_main" }
                ]
            ]
        };

        bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    // ✅ TAMPILKAN SUB-KATEGORI BERDASARKAN KATEGORI
    async function showSubCategories(bot, chatId, messageId, category) {
        let message = "";
        let subcategories = [];

        switch (category) {
            case 'pulsa':
                message = `📱 **PILIH OPERATOR PULSA**

Pilih operator yang diinginkan:`;
                subcategories = [
                    { name: "📶 AXIS", data: "axis" },
                    { name: "🔵 XL", data: "xl" },
                    { name: "🔴 TELKOMSEL", data: "telkomsel" },
                    { name: "🟢 INDOSAT", data: "indosat" },
                    { name: "🟡 SMARTFREN", data: "smartfren" },
                    { name: "🟣 TRI", data: "tri" }
                ];
                break;

            case 'pln':
                message = `⚡ **PRODUK PLN**

Pilih jenis produk PLN:`;
                subcategories = [
                    { name: "💡 PLN TOKEN", data: "token" },
                    { name: "📋 PLN TAGIHAN", data: "tagihan" }
                ];
                break;

            case 'game':
                message = `🎮 **VOUCHER GAME**

Pilih game yang diinginkan:`;
                subcategories = [
                    { name: "🔥 FREE FIRE", data: "ff" },
                    { name: "🎯 PUBG MOBILE", data: "pubg" },
                    { name: "⚔️ MOBILE LEGENDS", data: "ml" },
                    { name: "🕹️ GARENA SHELLS", data: "shell" },
                    { name: "🎮 STEAM WALLET", data: "steam" },
                    { name: "👾 RAZER GOLD", data: "razer" }
                ];
                break;

            case 'data':
                message = `📦 **PAKET DATA**

Pilih operator untuk paket data:`;
                subcategories = [
                    { name: "📶 AXIS", data: "axis" },
                    { name: "🔵 XL", data: "xl" },
                    { name: "🔴 TELKOMSEL", data: "telkomsel" },
                    { name: "🟢 INDOSAT", data: "indosat" },
                    { name: "🟡 SMARTFREN", data: "smartfren" }
                ];
                break;

            case 'ewallet':
                message = `💳 **E-WALLET & DIGITAL**

Pilih e-wallet yang diinginkan:`;
                subcategories = [
                    { name: "🟢 GOPAY", data: "gopay" },
                    { name: "🔵 OVO", data: "ovo" },
                    { name: "🔴 DANA", data: "dana" },
                    { name: "🟣 LINK AJA", data: "linkaja" },
                    { name: "🟠 SHOPEEPAY", data: "shopeepay" }
                ];
                break;

            default:
                message = "❌ Kategori belum tersedia";
        }

        const keyboard = {
            inline_keyboard: [
                ...subcategories.map(sub => [{
                    text: sub.name,
                    callback_data: `subcategory_${category}_${sub.data}`
                }]),
                [{ text: "⬅️ KEMBALI", callback_data: "back_to_categories" }]
            ]
        };

        try {
            await bot.editMessageText(message, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (error) {
            // Jika error edit, kirim message baru
            await bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        }
    }

    // ✅ TAMPILKAN PRODUK BERDASARKAN KATEGORI & SUB-KATEGORI (DIPERBAIKI)
    async function showProducts(bot, chatId, messageId, category, subcategory) {
        try {
            // VALIDASI PARAMETER
            if (!subcategory) {
                console.error('❌ Subcategory is undefined!');
                return bot.editMessageText(
                    "❌ Kategori tidak valid. Silakan coba lagi.",
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "⬅️ KEMBALI", callback_data: "back_to_categories" }]
                            ]
                        }
                    }
                );
            }

            let products = [];
            let title = "";

            console.log(`🔍 Mencari produk: ${category} - ${subcategory}`);

            // Ambil produk berdasarkan kategori
            if (category === 'pulsa') {
                const allProducts = await BotProductService.getPulsaProducts();
                console.log(`📱 Total produk pulsa: ${allProducts.length}`);
                
                products = allProducts.filter(p => 
                    p.operator && p.operator.toLowerCase() === subcategory.toLowerCase()
                );
                title = `📱 PULSA ${subcategory.toUpperCase()}`;
            } else {
                // Untuk kategori lain, gunakan method general
                products = await BotProductService.getProductsByCategory(category);
                console.log(`📦 Total produk ${category}: ${products.length}`);
                
                products = products.filter(p => 
                    p.subcategory && p.subcategory.toLowerCase() === subcategory.toLowerCase()
                );
                title = `📦 ${category.toUpperCase()} - ${subcategory.toUpperCase()}`;
            }

            console.log(`✅ Produk ditemukan: ${products.length} untuk ${subcategory}`);

            if (products.length === 0) {
                return bot.editMessageText(
                    `❌ Tidak ada produk untuk ${subcategory.toUpperCase()}\n\nSilakan pilih kategori lain.`,
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "⬅️ KEMBALI", callback_data: `category_${category}` }]
                            ]
                        }
                    }
                );
            }

            let message = `${title}\n\n`;
            
            // ✅ GUNAKAN formatProductName UNTUK MENGATASI ERROR MARKDOWN
            products.forEach((product, index) => {
                const displayName = formatProductName(product.name);
                message += `${index + 1}. ${displayName}\n`;
                message += `   💰 Rp ${product.price.toLocaleString('id-ID')}\n`;
                message += `   🆔 Kode: \`${product.code}\`\n\n`;
            });

            message += "💡 **Cara Order:**\n";
            message += "`/order [kode] [nomor]`\n";
            message += "Contoh: `/order AX10 08123456789`";

            const keyboard = {
                inline_keyboard: [
                    [{ text: "🔄 REFRESH", callback_data: `subcategory_${category}_${subcategory}` }],
                    [{ text: "⬅️ KEMBALI", callback_data: `category_${category}` }]
                ]
            };

            await bot.editMessageText(message, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });

        } catch (error) {
            console.error('Error showing products:', error);
            await bot.editMessageText(
                "❌ Gagal memuat produk. Silakan coba lagi.",
                {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "⬅️ KEMBALI", callback_data: "back_to_categories" }]
                        ]
                    }
                }
            );
        }
    }

    // ✅ TAMPILKAN DETAIL PRODUK (DIPERBAIKI)
    async function showProductDetail(bot, chatId, productCode) {
        try {
            const product = await BotProductService.findProductForBot(productCode);
            
            if (!product) {
                return bot.sendMessage(chatId, "❌ Produk tidak ditemukan.");
            }

            // ✅ GUNAKAN formatProductName JUGA DI SINI
            const displayName = formatProductName(product.name);

            const message = `📦 **DETAIL PRODUK**

🏷️ **Nama:** ${displayName}
💰 **Harga:** Rp ${product.price.toLocaleString('id-ID')}
🆔 **Kode:** \`${product.code}\`
📊 **Kategori:** ${product.category || 'Umum'}
🏢 **Operator:** ${product.operator || '-'}

💡 **Cara Order:**
\`/order ${product.code} [nomor_tujuan]\`

Contoh:
\`/order ${product.code} 08123456789\``;

            const keyboard = {
                inline_keyboard: [
                    [{ text: "📦 ORDER SEKARANG", callback_data: `order_${product.code}` }],
                    [{ text: "⬅️ KEMBALI", callback_data: "back_to_categories" }]
                ]
            };

            await bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });

        } catch (error) {
            console.error('Error showing product detail:', error);
            bot.sendMessage(chatId, "❌ Gagal memuat detail produk.");
        }
    }
}; // ✅ TAMBAHKAN KURUNG TUTUP UNTUK module.exports