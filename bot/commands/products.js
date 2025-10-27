// bot/commands/products.js
const ApiService = require('../services/ApiService');

// Helper function untuk hapus reply keyboard
async function removeReplyKeyboard(bot, chatId) {
    try {
        await bot.sendMessage(chatId, ' ', {
            reply_markup: { remove_keyboard: true }
        });
    } catch (error) {
        // Ignore error jika tidak ada keyboard
    }
}

const productsCommand = (bot) => {
    console.log('🔄 Loading products command...');
    
    bot.onText(/\/products|📱 BELI PULSA\/DATA|💰 CEK HARGA/, async (msg) => {
        const chatId = msg.chat.id;
        await removeReplyKeyboard(bot, chatId);
        await showCategoriesMenu(bot, chatId);
    });

    // Handle products button dari message text
    bot.on('message', async (msg) => {
        if (msg.text && msg.text.includes('📱 BELI PULSA/DATA')) {
            const chatId = msg.chat.id;
            await removeReplyKeyboard(bot, chatId);
            await showCategoriesMenu(bot, chatId);
        }
    });
};

// ✅ FIXED: Show main categories menu
async function showCategoriesMenu(bot, chatId, messageId = null) {
    try {
        console.log('🔄 Loading categories menu...');
        
        const message = `<b>🛍️ PILIH KATEGORI PRODUK</b>\n\n` +
                       `Pilih kategori produk yang ingin Anda beli:\n\n` +
                       `💡 <b>Cara Pilih:</b> Klik kategori yang diinginkan`;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📱 PULSA', callback_data: 'category_pulsa' },
                        { text: '📶 PAKET DATA', callback_data: 'category_data' }
                    ],
                    [
                        { text: '⚡ TOKEN PLN', callback_data: 'category_pln' },
                        { text: '🎮 VOUCHER GAME', callback_data: 'category_voucher' }
                    ],
                    [
                        { text: '🕹️ TOP UP GAME', callback_data: 'category_game' }
                    ],
                    [
                        { text: '🔍 CEK PRODUK', callback_data: 'search_product' },
                        { text: '🏠 MENU UTAMA', callback_data: 'main_menu' }
                    ]
                ]
            },
            parse_mode: 'HTML'
        };

        if (messageId) {
            await bot.editMessageText(message, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                reply_markup: keyboard.reply_markup
            });
        } else {
            await bot.sendMessage(chatId, message, keyboard);
        }

    } catch (error) {
        console.error('Error showing categories:', error);
        const errorMessage = '❌ Gagal memuat kategori produk.';
        
        if (messageId) {
            await bot.editMessageText(errorMessage, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML'
            });
        } else {
            await bot.sendMessage(chatId, errorMessage);
        }
    }
}

// ✅ FIXED: Show pulsa providers list
async function showPulsaProviders(bot, chatId, messageId = null) {
    try {
        console.log('🔄 Loading pulsa providers...');
        const result = await ApiService.getPulsaProviders();
        
        if (!result.success || !result.data || result.data.length === 0) {
            const message = '📱 DAFTAR OPERATOR PULSA\n\n🔄 Operator sedang tidak tersedia.';
            
            if (messageId) {
                await bot.editMessageText(message, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '⬅️ KEMBALI', callback_data: 'back_to_categories' }
                            ]
                        ]
                    }
                });
            } else {
                await bot.sendMessage(chatId, message, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '⬅️ KEMBALI', callback_data: 'back_to_categories' }
                            ]
                        ]
                    }
                });
            }
            return;
        }

        const providers = result.data;
        
        let message = `<b>📱 PILIH OPERATOR PULSA</b>\n\n`;
        message += `Pilih operator pulsa yang ingin Anda beli:\n\n`;
        
        providers.forEach((provider, index) => {
            message += `<b>${index + 1}. ${provider}</b>\n`;
        });

        message += `\n💡 <b>Cara Pilih:</b>\nKlik operator yang ingin dibeli`;

        const providerButtons = [];
        
        // Create buttons for providers (2 per row)
        for (let i = 0; i < providers.length; i += 2) {
            const row = [];
            row.push({ 
                text: `📱 ${providers[i]}`, 
                callback_data: `pulsa_${providers[i].toLowerCase()}`
            });
            
            if (providers[i + 1]) {
                row.push({ 
                    text: `📱 ${providers[i + 1]}`, 
                    callback_data: `pulsa_${providers[i + 1].toLowerCase()}`
                });
            }
            
            providerButtons.push(row);
        }

        // Add navigation buttons
        providerButtons.push([
            { text: '⬅️ KATEGORI LAIN', callback_data: 'back_to_categories' },
            { text: '🏠 MENU UTAMA', callback_data: 'main_menu' }
        ]);

        const keyboard = {
            reply_markup: {
                inline_keyboard: providerButtons
            },
            parse_mode: 'HTML'
        };

        if (messageId) {
            await bot.editMessageText(message, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                reply_markup: keyboard.reply_markup
            });
        } else {
            await bot.sendMessage(chatId, message, keyboard);
        }

    } catch (error) {
        console.error('Error showing pulsa providers:', error);
        const errorMessage = '❌ Gagal memuat daftar operator.';
        
        if (messageId) {
            await bot.editMessageText(errorMessage, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '⬅️ KEMBALI', callback_data: 'back_to_categories' }
                        ]
                    ]
                }
            });
        } else {
            await bot.sendMessage(chatId, errorMessage, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '⬅️ KEMBALI', callback_data: 'back_to_categories' }
                        ]
                    ]
                }
            });
        }
    }
}

// ✅ FIXED: Show products by category and provider
async function showCategoryProducts(bot, chatId, messageId, category, provider = null) {
    try {
        console.log(`🔄 Loading products for: ${category}, provider: ${provider}`);
        
        const filters = provider ? { provider } : {};
        const result = await ApiService.getProductsByCategory(category, filters);
        
        if (!result.success || !result.data || result.data.length === 0) {
            const providerText = provider ? ` ${provider}` : '';
            const backButton = category === 'pulsa' && provider ? 'back_to_providers' : 'back_to_categories';
            
            await bot.editMessageText(
                `📦 <b>PRODUK ${category.toUpperCase()}${providerText}</b>\n\n🔄 Produk sedang tidak tersedia.`,
                {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '⬅️ KEMBALI', callback_data: backButton }
                            ]
                        ]
                    }
                }
            );
            return;
        }

        const products = result.data;
        const providerText = provider ? ` ${provider}` : '';
        
        let message = `<b>📦 DAFTAR PRODUK ${category.toUpperCase()}${providerText}</b>\n\n`;
        
        products.forEach((product, index) => {
            message += `<b>${index + 1}. ${product.name}</b>\n`;
            message += `   💰 <b>Rp ${product.price.toLocaleString('id-ID')}</b>\n`;
            message += `   🆔 Kode: <code>${product.code}</code>\n`;
            if (product.denomination) {
                message += `   🔢 Nominal: ${product.denomination}\n`;
            }
            message += `   📦 Stok: ${product.stock || 'Tersedia'}\n\n`;
        });

        message += `💡 <b>Cara Order:</b>\n`;
        message += `Ketik: <code>/buy KODE_PRODUK NOMOR_HP</code>\n`;
        message += `Contoh: <code>/buy ${products[0]?.code || 'KODEPRODUK'} 08123456789</code>\n\n`;
        message += `🛒 <b>Total: ${products.length} produk tersedia</b>`;

        // Create navigation buttons based on context
        const navigationButtons = [];
        
        if (category === 'pulsa' && provider) {
            navigationButtons.push([
                { text: '⬅️ OPERATOR LAIN', callback_data: 'back_to_providers' }
            ]);
        } else {
            navigationButtons.push([
                { text: '⬅️ KATEGORI LAIN', callback_data: 'back_to_categories' }
            ]);
        }
        
        navigationButtons.push([
            { text: '🛒 CARA BELI', callback_data: 'show_buy_instructions' },
            { text: '🏠 MENU UTAMA', callback_data: 'main_menu' }
        ]);

        await bot.editMessageText(message, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: navigationButtons  // ✅ FIXED: Tidak dikomentari lagi
            }
        });

    } catch (error) {
        console.error(`Error loading products:`, error);
        await bot.editMessageText(
            `❌ Gagal memuat produk.`,
            {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '⬅️ KEMBALI', callback_data: 'back_to_categories' }
                        ]
                    ]
                }
            }
        );
    }
}

// ✅ FIXED: Show buy instructions
async function showBuyInstructions(bot, chatId, messageId) {
    const message = `<b>🛒 CARA MEMBELI PRODUK</b>\n\n` +
                   `Untuk membeli produk, gunakan perintah:\n\n` +
                   `<code>/buy KODE_PRODUK NOMOR_HP</code>\n\n` +
                   `<b>Contoh:</b>\n` +
                   `<code>/buy PULSA-TSEL-5 08123456789</code>\n\n` +
                   `<b>Penjelasan:</b>\n` +
                   `• <code>KODE_PRODUK</code>: Kode unik produk\n` +
                   `• <code>NOMOR_HP</code>: Nomor tujuan pengisian\n\n` +
                   `💡 <b>Tips:</b>\n` +
                   `• Pastikan nomor HP benar\n` +
                   `• Saldo mencukupi\n` +
                   `• Cek kode produk di daftar produk`;

    await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⬅️ KEMBALI', callback_data: 'back_to_products' },
                    { text: '🏠 MENU UTAMA', callback_data: 'main_menu' }
                ]
            ]
        }
    });
}

// Export functions
module.exports = productsCommand;
module.exports.showCategoriesMenu = showCategoriesMenu;
module.exports.showPulsaProviders = showPulsaProviders;
module.exports.showCategoryProducts = showCategoryProducts;
module.exports.showBuyInstructions = showBuyInstructions;