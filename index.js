const TelegramBot = require('node-telegram-bot-api');
const digiflazz = require('./digiflazz');
const express = require('express');
const commands= require("./handlers/commands");

console.log("🤖 Starting Pulsa Telegram Bot - Optimized Version...");

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
    console.log("❌ ERROR: TELEGRAM_TOKEN not set");
    process.exit(1);
}

// Bot instance dengan configuration yang lebih baik
const bot = new TelegramBot(token, {
    polling: {
        interval: 1000,      // Increase interval
        timeout: 10,
        autoStart: false,    // Manual start
        params: {
            timeout: 60,
            limit: 100
        }
    }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Storage
const userStates = new Map();
const userData = new Map();
const userProfiles = new Map();
const userBalances = new Map();

// ==================== BOT COMMANDS ====================

bot.onText(/\/start/, commands.start);
// CEK HARGA REAL
bot.onText(/📊 CEK HARGA/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const loadingMsg = await bot.sendMessage(chatId, '🔄 Mengambil daftar harga terbaru dari Digiflazz...');
        
        const prices = await digiflazz.getPriceList();
        
        if (prices && prices.success && prices.data && Array.isArray(prices.data)) {
            const pulseProducts = prices.data
                .filter(p => p && p.category && p.category.toLowerCase().includes('pulsa'))
                .slice(0, 6); // Kurangi jumlah produk
            
            if (pulseProducts.length > 0) {
                let message = '📋 *DAFTAR HARGA PULSA TERBARU*\n\n';
                
                pulseProducts.forEach((product, index) => {
                    const name = (product.product_name || 'Unknown').replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
                    const price = product.price || 0;
                    const brand = (product.brand || 'Unknown').replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
                    
                    message += `📱 *${name}*\n`;
                    message += `💵 Rp ${price.toLocaleString()}\n`;
                    message += `🏷️ ${brand}\n`;
                    
                    if (index < pulseProducts.length - 1) message += '────────────\n';
                });
                
                message += `\n_Data real-time dari Digiflazz_`;
                
                await bot.editMessageText(message, {
                    chat_id: chatId,
                    message_id: loadingMsg.message_id,
                    parse_mode: 'Markdown'
                });
            } else {
                await bot.editMessageText('❌ Tidak ada produk pulsa ditemukan', {
                    chat_id: chatId,
                    message_id: loadingMsg.message_id
                });
            }
        } else {
            await bot.editMessageText('❌ Gagal mengambil data harga', {
                chat_id: chatId,
                message_id: loadingMsg.message_id
            });
        }
    } catch (error) {
        await bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
});

// CEK SALDO DIGIFLAZZ
bot.onText(/💳 CEK SALDO/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const loadingMsg = await bot.sendMessage(chatId, '🔄 Mengecek saldo Digiflazz...');
        
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
        await bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
});

// BELI PULSA
bot.onText(/🛒 BELI PULSA/, (msg) => {
    const chatId = msg.chat.id;
    userStates.set(chatId, 'waiting_phone_pulsa');
    
    bot.sendMessage(chatId, '📱 **MASUKKAN NOMOR HP**\n\nContoh: 081234567890', {
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: [['🚫 BATAL']],
            resize_keyboard: true
        }
    });
});

// HANDLE PHONE INPUT
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    if (text.startsWith('/')) return;
    
    const state = userStates.get(chatId);
    
    if (state === 'waiting_phone_pulsa') {
        if (text === '🚫 BATAL') {
            userStates.set(chatId, 'main_menu');
            bot.sendMessage(chatId, '❌ Pembelian dibatalkan.', {
                reply_markup: {
                    keyboard: [
                        ['📋 PENDAFTARAN', '💰 DEPOSIT'],
                        ['🛒 BELI PULSA', '📦 PAKET DATA', '🎮 GAMES'],
                        ['💳 E-WALLET', '💡 PLN', '📊 CEK HARGA'],
                        ['💼 CEK SALDO', '👤 PROFIL', '❓ BANTUAN']
                    ],
                    resize_keyboard: true
                }
            });
            return;
        }
        
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
            await bot.sendMessage(chatId, '❌ Format nomor tidak valid! Contoh: 081234567890');
        }
    }
});

// HANDLE CALLBACK QUERIES
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
});

// PROFIL USER
bot.onText(/👤 PROFIL/, (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;
    
    const profileMsg = `👤 **PROFIL PENGGUNA**\n\n` +
                      `🆔 ID: ${user.id}\n` +
                      `📛 Nama: ${user.first_name} ${user.last_name || ''}\n` +
                      `🤖 Username: @${user.username || 'Tidak ada'}\n` +
                      `📅 Bergabung: ${new Date().toLocaleDateString('id-ID')}`;
    
    bot.sendMessage(chatId, profileMsg, {
        parse_mode: 'Markdown'
    });
});

// BANTUAN
bot.onText(/❓ BANTUAN/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpMsg = `❓ **BANTUAN & PANDUAN**\n\n` +
                   `*CARA PENGGUNAAN:*\n` +
                   `1. Pilih "Beli Pulsa"\n` +
                   `2. Masukkan nomor HP\n` +
                   `3. Pilih operator & nominal\n` +
                   `4. Konfirmasi pembelian\n\n` +
                   `*FITUR LAIN:*\n` +
                   `• 💰 Deposit: Top up saldo member\n` +
                   `• 📊 Cek Harga: Lihat harga terbaru\n` +
                   `• 👤 Profil: Lihat data Anda\n\n` +
                   `*SUPPORT:*\n` +
                   `Hubungi admin untuk bantuan lebih lanjut.`;
    
    bot.sendMessage(chatId, helpMsg, {
        parse_mode: 'Markdown'
    });
});

// ==================== POLLING MANAGEMENT ====================

let isPolling = false;
let pollingErrorCount = 0;
const MAX_ERROR_COUNT = 10;

function startPolling() {
    if (isPolling) {
        console.log('⚠️ Polling already running, skipping...');
        return;
    }
    
    console.log('🔄 Starting bot polling...');
    
    bot.startPolling().then(() => {
        isPolling = true;
        pollingErrorCount = 0;
        console.log('✅ Bot polling started successfully');
    }).catch(error => {
        console.log('❌ Failed to start polling:', error.message);
        isPolling = false;
        
        // Retry after 10 seconds
        setTimeout(() => {
            startPolling();
        }, 10000);
    });
}

function stopPolling() {
    if (isPolling) {
        console.log('🛑 Stopping bot polling...');
        bot.stopPolling();
        isPolling = false;
    }
}

// Enhanced error handling - jangan restart terlalu sering
bot.on('polling_error', (error) => {
    pollingErrorCount++;
    
    if (error.message.includes('409 Conflict')) {
        // Ini error yang expected, cukup log saja
        if (pollingErrorCount % 10 === 0) { // Log setiap 10 error untuk mengurangi spam
            console.log('⚠️ Polling conflict detected (normal in cloud environment)');
        }
    } else {
        console.log('❌ Polling Error:', error.message);
    }
    
    // Jika error terlalu banyak, restart polling
    if (pollingErrorCount >= MAX_ERROR_COUNT) {
        console.log(`🔄 Too many errors (${pollingErrorCount}), restarting polling...`);
        stopPolling();
        setTimeout(() => {
            startPolling();
        }, 5000);
    }
});

bot.on('webhook_error', (error) => {
    console.log('❌ Webhook Error:', error);
});

// ==================== EXPRESS SERVER ====================

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Pulsa Telegram Bot is running!',
        polling: isPolling,
        pollingErrors: pollingErrorCount,
        users: userProfiles.size,
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        polling: isPolling,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Endpoint untuk restart polling
app.get('/restart-polling', (req, res) => {
    stopPolling();
    setTimeout(() => {
        startPolling();
        res.json({ 
            status: 'restarted', 
            message: 'Polling restart initiated',
            timestamp: new Date().toISOString()
        });
    }, 2000);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🌐 Health check: http://0.0.0.0:${PORT}/health`);
    
    // Start polling setelah server ready
    setTimeout(() => {
        startPolling();
    }, 3000);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down gracefully...');
    stopPolling();
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down...');
    stopPolling();
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

console.log("✅ Bot initialization completed!");
