const TelegramBot = require('node-telegram-bot-api');
const digiflazz = require('./digiflazz');
const express = require('express');

console.log("🤖 Starting Pulsa Telegram Bot with Custom SKUs...");

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
    console.log("❌ ERROR: TELEGRAM_TOKEN not set");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const userStates = new Map();
const userData = new Map();

// PRODUCT MAP DENGAN SKU CUSTOM ANDA
const productMap = {
    // TELKOMSEL - menggunakan Tkl
    'telkomsel_5k': { code: 'Tkl5', name: 'Telkomsel 5.000', price: 6000 },
    'telkomsel_10k': { code: 'Tkl10', name: 'Telkomsel 10.000', price: 11000 },
    'telkomsel_25k': { code: 'Tkl25', name: 'Telkomsel 25.000', price: 26000 },
    'telkomsel_50k': { code: 'Tkl50', name: 'Telkomsel 50.000', price: 51000 },
    'telkomsel_100k': { code: 'Tkl100', name: 'Telkomsel 100.000', price: 101000 },
    
    // INDOSAT - menggunakan IND
    'indosat_5k': { code: 'IND5', name: 'Indosat 5.000', price: 6000 },
    'indosat_10k': { code: 'IND10', name: 'Indosat 10.000', price: 11000 },
    'indosat_25k': { code: 'IND25', name: 'Indosat 25.000', price: 26000 },
    'indosat_50k': { code: 'IND50', name: 'Indosat 50.000', price: 51000 },
    'indosat_100k': { code: 'IND100', name: 'Indosat 100.000', price: 101000 },
    
    // XL - menggunakan X
    'xl_5k': { code: 'X5', name: 'XL 5.000', price: 6000 },
    'xl_10k': { code: 'X10', name: 'XL 10.000', price: 11000 },
    'xl_25k': { code: 'X25', name: 'XL 25.000', price: 26000 },
    'xl_50k': { code: 'X50', name: 'XL 50.000', price: 51000 },
    'xl_100k': { code: 'X100', name: 'XL 100.000', price: 101000 },
    
    // AXIS - menggunakan Ax
    'axis_5k': { code: 'Ax5', name: 'Axis 5.000', price: 6000 },
    'axis_10k': { code: 'Ax10', name: 'Axis 10.000', price: 11000 },
    'axis_25k': { code: 'Ax25', name: 'Axis 25.000', price: 26000 },
    'axis_50k': { code: 'Ax50', name: 'Axis 50.000', price: 51000 },
    'axis_100k': { code: 'Ax100', name: 'Axis 100.000', price: 101000 }
};

console.log("✅ Bot initialized with custom SKUs");

// ==================== BOT COMMANDS ====================

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userStates.set(chatId, 'main_menu');
    
    bot.sendMessage(chatId, `🤖 **TOKO PULSA DIGIFLAZZ**\n\nSelamat datang! Saya siap melayani pembelian pulsa dan paket data Anda.\n\nPilih menu di bawah:`, {
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: [
                ['🛒 BELI PULSA', '📦 PAKET DATA'],
                ['📊 CEK HARGA REAL', '👤 PROFIL'],
                ['💳 CEK SALDO', '❓ BANTUAN']
            ],
            resize_keyboard: true
        }
    });
});

// CEK HARGA REAL dari Digiflazz - FIXED VERSION
// CEK HARGA REAL - FIXED VERSION BERDASARKAN STRUKTUR DATA AKTUAL
bot.onText(/📊 CEK HARGA REAL/, async (msg) => {
    const chatId = msg.chat.id;
    
    const loadingMsg = await bot.sendMessage(chatId, '🔄 Mengambil daftar harga terbaru dari Digiflazz...');
    
    try {
        const prices = await digiflazz.getPriceList();
        
        console.log('🔍 DEBUG - Full response:', JSON.stringify(prices, null, 2));
        
        if (prices && prices.success && prices.data) {
            let productsToShow = [];
            
            // CASE 1: Data adalah array langsung
            if (Array.isArray(prices.data)) {
                console.log('✅ Data format: Array, length:', prices.data.length);
                
                // ✅ FILTER YANG SESUAI DENGAN DATA AKTUAL
                productsToShow = prices.data
                    .filter(p => p && 
                        p.category && 
                        p.category.toLowerCase().includes('pulsa') && // Lebih fleksibel
                        p.buyer_product_status === true &&           // Hanya produk aktif
                        p.price && p.price > 0                       // Harga valid
                    )
                    .slice(0, 10); // Ambil 10 pertama
            }
            // CASE 2: Data adalah object (backup plan)
            else if (prices.data && typeof prices.data === 'object') {
                console.log('🔄 Data format: Object, converting to array');
                productsToShow = Object.values(prices.data)
                    .filter(p => p && typeof p === 'object')
                    .slice(0, 10);
            }
            
            console.log('🔍 Products after filter:', productsToShow.length);
            
            if (productsToShow.length > 0) {
                let message = '📋 **DAFTAR HARGA PULSA REAL**\n\n';
                
                productsToShow.forEach((product, index) => {
                    // ✅ FIELD NAMES SESUAI DATA AKTUAL DARI DIGIFLAZZ
                    const productName = product.product_name || 'Unknown Product';
                    const price = product.price || 0;
                    const brand = product.brand || 'Unknown';
                    const sku = product.buyer_sku_code || 'N/A';
                    const stock = product.stock;
                    
                    message += `📱 **${productName}**\n`;
                    message += `💵 Harga: Rp ${price.toLocaleString()}\n`;
                    message += `🏷️ Operator: ${brand}\n`;
                    message += `🆔 SKU: ${sku}\n`;
                    
                    // Tampilkan status stok jika ada
                    if (stock !== undefined) {
                        message += `📦 Stok: ${stock}\n`;
                    }
                    
                    if (index < productsToShow.length - 1) {
                        message += '\n' + '─'.repeat(25) + '\n\n';
                    }
                });
                
                message += `\n_Total: ${productsToShow.length} produk_`;
                
                await bot.editMessageText(message, {
                    chat_id: chatId,
                    message_id: loadingMsg.message_id,
                    parse_mode: 'Markdown'
                });
                
            } else {
                // Fallback: tampilkan data mentah untuk debug
                await showRawDataFallback(chatId, loadingMsg.message_id, prices);
            }
        } else {
            const errorMsg = prices?.error?.message || prices?.error || 'Unknown error';
            await bot.editMessageText(`❌ Gagal mengambil harga:\n${errorMsg}`, {
                chat_id: chatId,
                message_id: loadingMsg.message_id
            });
        }
    } catch (error) {
        console.error('❌ Error in CEK HARGA REAL:', error);
        await bot.editMessageText(`❌ Terjadi error:\n${error.message}`, {
            chat_id: chatId,
            message_id: loadingMsg.message_id
        });
    }
});

// Helper function untuk fallback
async function showRawDataFallback(chatId, messageId, prices) {
    let rawData = 'No data';
    if (prices && prices.data && Array.isArray(prices.data) && prices.data.length > 0) {
        rawData = JSON.stringify(prices.data[0], null, 2);
    }
    
    await bot.editMessageText(
        `❌ Tidak ada produk yang lolos filter.\n\n` +
        `📝 **Data sample:**\n\`\`\`json\n${rawData.substring(0, 1000)}\n\`\`\`\n\n` +
        `💡 **Solusi:**\n` +
        `• Cek struktur data di log\n` +
        `• Gunakan /debugstructure\n` +
        `• Adjust filter criteria`,
        {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown'
        }
    );
}
// CEK SALDO DIGIFLAZZ
bot.onText(/💳 CEK SALDO/, async (msg) => {
    const chatId = msg.chat.id;
    
    const loadingMsg = await bot.sendMessage(chatId, '🔄 Mengecek saldo Digiflazz...');
    
    try {
        const balance = await digiflazz.checkBalance();
        
        if (balance.success) {
            await bot.editMessageText(`💰 **SALDO DIGIFLAZZ**\n\n💵 Rp ${balance.balance.deposit.toLocaleString()}\n\n_Update: ${new Date().toLocaleTimeString('id-ID')}_`, {
                chat_id: chatId,
                message_id: loadingMsg.message_id,
                parse_mode: 'Markdown'
            });
        } else {
            await bot.editMessageText(`❌ Gagal cek saldo:\n${balance.error}`, {
                chat_id: chatId,
                message_id: loadingMsg.message_id
            });
        }
    } catch (error) {
        console.error('Error in CEK SALDO:', error);
        await bot.editMessageText(`❌ Error saat cek saldo:\n${error.message}`, {
            chat_id: chatId,
            message_id: loadingMsg.message_id
        });
    }
});

// BELI PULSA FLOW
bot.onText(/🛒 BELI PULSA/, (msg) => {
    const chatId = msg.chat.id;
    userStates.set(chatId, 'waiting_phone');
    
    bot.sendMessage(chatId, '📱 **MASUKKAN NOMOR HP**\n\nContoh: 081234567890\n\nPastikan nomor sudah benar!', {
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: [['🚫 BATAL']],
            resize_keyboard: true
        }
    });
});

// BATAL COMMAND
bot.onText(/🚫 BATAL/, (msg) => {
    const chatId = msg.chat.id;
    userStates.set(chatId, 'main_menu');
    
    bot.sendMessage(chatId, '❌ Transaksi dibatalkan.', {
        reply_markup: {
            keyboard: [
                ['🛒 BELI PULSA', '📦 PAKET DATA'],
                ['📊 CEK HARGA REAL', '👤 PROFIL']
            ],
            resize_keyboard: true
        }
    });
});

// HANDLE PHONE NUMBER INPUT
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    if (text.startsWith('/')) return;
    
    const state = userStates.get(chatId);
    
    if (!state) {
        userStates.set(chatId, 'main_menu');
        return;
    }
    
    if (['🛒 BELI PULSA', '📊 CEK HARGA REAL', '🚫 BATAL', '📦 PAKET DATA', '👤 PROFIL', '💳 CEK SALDO', '❓ BANTUAN'].includes(text)) {
        return;
    }
    
    if (state === 'waiting_phone') {
        if (/^08[0-9]{9,12}$/.test(text)) {
            userData.set(chatId, { phone: text });
            userStates.set(chatId, 'waiting_operator');
            
            await bot.sendMessage(chatId, `📱 **NOMOR:** ${text}\n\nPilih operator:`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '📱 TELKOMSEL', callback_data: 'operator_telkomsel' },
                            { text: '📱 XL', callback_data: 'operator_xl' }
                        ],
                        [
                            { text: '📱 INDOSAT', callback_data: 'operator_indosat' },
                            { text: '📱 AXIS', callback_data: 'operator_axis' }
                        ],
                        [
                            { text: '🚫 Batalkan', callback_data: 'cancel' }
                        ]
                    ]
                }
            });
        } else {
            await bot.sendMessage(chatId, '❌ Format nomor tidak valid!\n\nMasukkan nomor HP yang benar:\nContoh: 081234567890');
        }
    }
});

// HANDLE CALLBACK QUERIES (BUTTON CLICKS)
bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const data = callbackQuery.data;
    
    await bot.answerCallbackQuery(callbackQuery.id);
    
    if (data === 'cancel') {
        userStates.set(chatId, 'main_menu');
        await bot.editMessageText('❌ Transaksi dibatalkan.', {
            chat_id: chatId,
            message_id: message.message_id
        });
        return;
    }
    
    // Handle operator selection
    if (data.startsWith('operator_')) {
        const operator = data.replace('operator_', '');
        const user = userData.get(chatId);
        
        if (user) {
            userData.set(chatId, { ...user, operator });
            userStates.set(chatId, 'waiting_amount');
            
            await bot.editMessageText(`📱 **NOMOR:** ${user.phone}\n📞 **OPERATOR:** ${operator.toUpperCase()}\n\nPilih nominal:`, {
                chat_id: chatId,
                message_id: message.message_id,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '💰 5.000', callback_data: `nominal_${operator}_5k` },
                            { text: '💰 10.000', callback_data: `nominal_${operator}_10k` }
                        ],
                        [
                            { text: '💰 25.000', callback_data: `nominal_${operator}_25k` },
                            { text: '💰 50.000', callback_data: `nominal_${operator}_50k` }
                        ],
                        [
                            { text: '💰 100.000', callback_data: `nominal_${operator}_100k` }
                        ],
                        [
                            { text: '🚫 Batalkan', callback_data: 'cancel' }
                        ]
                    ]
                }
            });
        }
    }
    
    // Handle nominal selection
    if (data.startsWith('nominal_')) {
        const parts = data.replace('nominal_', '').split('_');
        const operator = parts[0];
        const nominal = parts[1];
        const productKey = `${operator}_${nominal}`;
        
        const selectedProduct = productMap[productKey];
        const user = userData.get(chatId);
        
        if (selectedProduct && user) {
            await bot.editMessageText(`✅ **KONFIRMASI PEMESANAN**\n\n📱 Nomor: ${user.phone}\n📞 Operator: ${operator.toUpperCase()}\n💵 Produk: ${selectedProduct.name}\n💰 Harga: Rp ${selectedProduct.price.toLocaleString()}\n\n⚠️ Pastikan data sudah benar!\nKetik ✅ KONFIRMASI untuk melanjutkan`, {
                chat_id: chatId,
                message_id: message.message_id,
                parse_mode: 'Markdown'
            });
            
            userData.set(chatId, { 
                ...user, 
                productCode: selectedProduct.code,
                productName: selectedProduct.name,
                price: selectedProduct.price
            });
            userStates.set(chatId, 'waiting_confirmation');
        } else {
            await bot.editMessageText(`❌ Produk tidak tersedia: ${productKey}\n\nSilakan pilih operator dan nominal lain.`, {
                chat_id: chatId,
                message_id: message.message_id
            });
        }
    }
});

// Handle confirmation message
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const state = userStates.get(chatId);
    
    if (state === 'waiting_confirmation' && text === '✅ KONFIRMASI') {
        const user = userData.get(chatId);
        
        if (user) {
            await bot.sendMessage(chatId, `🔄 **MEMPROSES TRANSAKSI**\n\n📱 ${user.phone}\n💵 ${user.productName}\n💰 Rp ${user.price.toLocaleString()}\n\nTunggu sebentar...`, {
                parse_mode: 'Markdown'
            });
            
            // Process real transaction dengan Digiflazz
            const result = await digiflazz.purchase(user.productCode, user.phone);
            
            if (result.success) {
                const transaction = result.data;
                await bot.sendMessage(chatId, `🎉 **TRANSAKSI BERHASIL!**\n\n📱 Nomor: ${user.phone}\n💵 Produk: ${user.productName}\n💰 Harga: Rp ${user.price.toLocaleString()}\n🆔 Ref: ${result.refId}\n📦 SN: ${transaction.sn || 'N/A'}\n⏱️ Status: ${transaction.status}\n\nTerima kasih telah berbelanja! 🛍️`, {
                    parse_mode: 'Markdown'
                });
            } else {
                await bot.sendMessage(chatId, `❌ **TRANSAKSI GAGAL**\n\n📱 ${user.phone}\n💵 ${user.productName}\n\nError: ${result.error?.message || result.error || 'Unknown error'}\n\nSilakan coba lagi atau hubungi admin.`, {
                    parse_mode: 'Markdown'
                });
            }
            
            // Reset state
            userStates.set(chatId, 'main_menu');
            userData.delete(chatId);
        }
    }
});

// PROFIL COMMAND
bot.onText(/👤 PROFIL/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, `👤 **PROFIL PENGGUNA**\n\n🆔 ID: ${msg.from.id}\n📛 Nama: ${msg.from.first_name} ${msg.from.last_name || ''}\n🤖 Username: @${msg.from.username || 'Tidak ada'}\n\n📅 Bergabung: ${new Date().toLocaleDateString('id-ID')}`, {
        parse_mode: 'Markdown'
    });
});

// BANTUAN COMMAND
bot.onText(/❓ BANTUAN/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, `❓ **BANTUAN & PANDUAN**\n\n🔧 **Cara penggunaan:**\n1. Pilih "Beli Pulsa"\n2. Masukkan nomor HP\n3. Pilih operator & nominal\n4. Konfirmasi pembelian\n\n💰 **Cek Saldo:** Gunakan menu "Cek Saldo"\n📊 **Harga Real:** Data langsung dari Digiflazz\n\n📞 **Support:** Hubungi admin untuk bantuan.\n\n🛠️ **Status:** Bot Active ✅`, {
        parse_mode: 'Markdown'
    });
});
// DEBUG STRUCTURE COMMAND
bot.onText(/\/debugstructure/, async (msg) => {
    const chatId = msg.chat.id;
    
    const loadingMsg = await bot.sendMessage(chatId, '🔍 Menganalisis struktur data Digiflazz...');
    
    try {
        const prices = await digiflazz.getPriceList();
        
        let debugMessage = '🔧 **STRUKTUR DATA DIGIFLAZZ**\n\n';
        
        if (prices && prices.success && prices.data) {
            debugMessage += `✅ Success: ${prices.success}\n`;
            debugMessage += `📊 Data Type: ${typeof prices.data}\n`;
            
            if (Array.isArray(prices.data)) {
                debugMessage += `🔢 Array Length: ${prices.data.length}\n\n`;
                
                if (prices.data.length > 0) {
                    const sample = prices.data[0];
                    debugMessage += `📝 **SAMPLE PRODUCT STRUCTURE:**\n\`\`\`json\n${JSON.stringify(sample, null, 2).substring(0, 1500)}\n\`\`\`\n\n`;
                    
                    // Analisis field yang ada
                    debugMessage += `🔍 **FIELD ANALYSIS:**\n`;
                    const fields = Object.keys(sample);
                    fields.forEach(field => {
                        debugMessage += `• ${field}: ${typeof sample[field]} = ${JSON.stringify(sample[field]).substring(0, 50)}\n`;
                    });
                }
            } else if (typeof prices.data === 'object') {
                debugMessage += `🔢 Object Keys: ${Object.keys(prices.data).length}\n\n`;
                const firstKey = Object.keys(prices.data)[0];
                if (firstKey) {
                    debugMessage += `📝 **SAMPLE STRUCTURE:**\n\`\`\`json\n${JSON.stringify(prices.data[firstKey], null, 2).substring(0, 1500)}\n\`\`\``;
                }
            }
        } else {
            debugMessage += `❌ Invalid response: ${JSON.stringify(prices)}`;
        }
        
        await bot.editMessageText(debugMessage, {
            chat_id: chatId,
            message_id: loadingMsg.message_id,
            parse_mode: 'Markdown'
        });
        
    } catch (error) {
        await bot.editMessageText(`❌ Error: ${error.message}`, {
            chat_id: chatId,
            message_id: loadingMsg.message_id
        });
    }
});
// PAKET DATA COMMAND
bot.onText(/📦 PAKET DATA/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, `📦 **PAKET DATA**\n\nFitur paket data sedang dalam pengembangan.\n\nUntuk sementara, gunakan menu "Beli Pulsa" untuk pembelian pulsa reguler.`, {
        parse_mode: 'Markdown'
    });
});

// ERROR HANDLING
bot.on('polling_error', (error) => {
    console.log('❌ Polling Error:', error.message);
});

bot.on('webhook_error', (error) => {
    console.log('❌ Webhook Error:', error);
});

// ==================== EXPRESS SERVER FOR RENDER ====================
const app = express();
const PORT = process.env.PORT || 3000;

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Pulsa Telegram Bot is running!',
    timestamp: new Date().toISOString()
  });
});

// Health check untuk Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'Telegram Pulsa Bot',
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`✅ Bot is live and ready!`);
});

console.log("✅ Bot with Custom SKUs is running!");
