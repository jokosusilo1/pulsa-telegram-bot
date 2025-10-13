const});

// CEK SALDO DIGIFLAZZ
bot.onText(/💳 CEK SALDO/, async (msg) => {
    const chatId = msg.chat.id;
    
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

console.log("✅ Bot with Custom SKUs is running!");
console.log("💡 Test with: /start -> 📊 CEK HARGA REAL -> 💳 CEK SALDO");
console.log("🛒 Available operators: Telkomsel, XL, Indosat, Axis");
