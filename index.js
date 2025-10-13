    ewallet: {
        'gopay_10k': { code: 'GOPAY10', name: 'Gopay 10.000', price: 10500, category: 'ewallet' },
        'gopay_25k': { code: 'GOPAY25', name: 'Gopay 25.000', price: 25800, category: 'ewallet' },
        'gopay_50k': { code: 'GOPAY50', name: 'Gopay 50.000', price: 50800, category: 'ewallet' },
        'ovo_10k': { code: 'OVO10', name: 'OVO 10.000', price: 10600, category: 'ewallet' },
        'ovo_25k': { code: 'OVO25', name: 'OVO 25.000', price: 25900, category: 'ewallet' },
        'dana_10k': { code: 'DANA10', name: 'DANA 10.000', price: 10400, category: 'ewallet' }
    },

    // PLN
    pln: {
        'pln_20k': { code: 'PLN20', name: 'Token PLN 20.000', price: 20500, category: 'pln' },
        'pln_50k': { code: 'PLN50', name: 'Token PLN 50.000', price: 50500, category: 'pln' },
        'pln_100k': { code: 'PLN100', name: 'Token PLN 100.000', price: 100500, category: 'pln' },
        'pln_200k': { code: 'PLN200', name: 'Token PLN 200.000', price: 200500, category: 'pln' }
    }
};

// Fungsi helper
function escapeMarkdown(text) {
    if (typeof text !== 'string') return String(text);
    return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

function getCurrentBalance(chatId) {
    return userBalances.get(chatId) || 0;
}

function addBalance(chatId, amount) {
    const current = getCurrentBalance(chatId);
    userBalances.set(chatId, current + amount);
    return current + amount;
}

function deductBalance(chatId, amount) {
    const current = getCurrentBalance(chatId);
    if (current < amount) return false;
    userBalances.set(chatId, current - amount);
    return true;
}

console.log("✅ Bot initialized with complete features");

// ==================== BOT COMMANDS ====================

// START COMMAND - MENU UTAMA
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    // Auto register user jika belum terdaftar
    if (!userProfiles.has(chatId)) {
        userProfiles.set(chatId, {
            id: userId,
            name: `${msg.from.first_name} ${msg.from.last_name || ''}`.trim(),
            username: msg.from.username || '',
            phone: '',
            registered: false,
            joinDate: new Date()
        });
        userBalances.set(chatId, 0);
    }
    
    userStates.set(chatId, 'main_menu');
    
    const welcomeMessage = `🤖 **SELAMAT DATANG DI TOKO PULSA DIGIFLAZZ**\n\n` +
                          `Halo *${escapeMarkdown(msg.from.first_name)}*! 👋\n\n` +
                          `Saya siap melayani kebutuhan pulsa, paket data, game, dan lainnya.\n\n` +
                          `*💡 Fitur yang tersedia:*\n` +
bot.onText(/📋 PENDAFTARAN/, (msg) => {
    const chatId = msg.chat.id;
    const profile = userProfiles.get(chatId);
    
    if (profile && profile.registered) {
        bot.sendMessage(chatId, `✅ *ANDA SUDAH TERDAFTAR SEBAGAI MEMBER*\n\n` +
                              `📛 Nama: ${profile.name}\n` +
                              `📞 Telepon: ${profile.phone || 'Belum diisi'}\n` +
                              `📅 Bergabung: ${profile.joinDate.toLocaleDateString('id-ID')}\n\n` +
                              `Untuk mengubah data, hubungi admin.`, {
            parse_mode: 'Markdown'
        });
        return;
    }
    
    userStates.set(chatId, 'registration_phone');
    userData.set(chatId, { step: 'phone' });
    
    bot.sendMessage(chatId, `📝 *FORM PENDAFTARAN MEMBER*\n\n` +
                          `Silakan lengkapi data diri Anda:\n\n` +
                          `1. Masukkan nomor telepon Anda:\n` +
                          `Contoh: 081234567890`, {
        parse_mode: 'Markdown',
            keyboard: [['🚫 BATALKAN']],
            resize_keyboard: true
        }
    });
});

// DEPOSIT SALDO
bot.onText(/💰 DEPOSIT/, (msg) => {
    const chatId = msg.chat.id;
    userStates.set(chatId, 'deposit_amount');
    
    const currentBalance = getCurrentBalance(chatId);
    
    bot.sendMessage(chatId, `💰 *DEPOSIT SALDO*\n\n` +
                          `Saldo Anda saat ini: *Rp ${currentBalance.toLocaleString()}*\n\n` +
                          `Masukkan nominal deposit (minimal Rp 10.000):\n` +
                          `Contoh: 50000`, {
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: [
                ['10000', '50000', '100000'],
                ['200000', '500000', '🚫 BATALKAN']
            ],
            resize_keyboard: true
        }
    });
});

// CEK SALDO MEMBER
bot.onText(/💼 CEK SALDO/, (msg) => {
    const chatId = msg.chat.id;
    const balance = getCurrentBalance(chatId);
    const profile = userProfiles.get(chatId);
    
    let message = `💰 *SALDO ANDA*\n\n`;
    message += `💵 Saldo: *Rp ${balance.toLocaleString()}*\n`;
    
    if (balance === 0) {
        message += `\n⚠️ Saldo Anda kosong. Lakukan deposit untuk bisa bertransaksi.\n`;
        message += `Gunakan menu *💰 DEPOSIT* untuk top up saldo.`;
    } else if (balance < 10000) {
        message += `\n💡 Saldo Anda hampir habis. Disarankan untuk deposit ulang.`;
    } else {
        message += `\n✅ Saldo mencukupi untuk transaksi.`;
    }
    
    message += `\n\n📊 *STATISTIK:*\n`;
    message += `• Member: ${profile?.registered ? '✅ Terdaftar' : '❌ Belum'}\n`;
    message += `• Bergabung: ${profile?.joinDate.toLocaleDateString('id-ID') || 'N/A'}`;
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown'
    });
});

// PROFIL USER
bot.onText(/👤 PROFIL/, (msg) => {
    const chatId = msg.chat.id;
    const profile = userProfiles.get(chatId);
    const balance = getCurrentBalance(chatId);
    
    if (!profile) {
        bot.sendMessage(chatId, '❌ Profil tidak ditemukan. Gunakan /start untuk mendaftar.');
        return;
    }
    
    const profileMessage = `👤 *PROFIL MEMBER*\n\n` +
                          `🆔 ID: ${profile.id}\n` +
                          `📛 Nama: ${profile.name}\n` +
                          `📞 Telepon: ${profile.phone || 'Belum diisi'}\n` +
                          `🤖 Username: @${profile.username || 'Tidak ada'}\n\n` +
                          `💰 Saldo: Rp ${balance.toLocaleString()}\n` +
                          `📅 Bergabung: ${profile.joinDate.toLocaleDateString('id-ID')}\n` +
                          `✅ Status: ${profile.registered ? 'Member Terdaftar' : 'Belum Lengkap'}\n\n` +
                          `💡 *Tips:*\n` +
                          `• Gunakan menu 📋 PENDAFTARAN untuk melengkapi data\n` +
                          `• Gunakan menu 💰 DEPOSIT untuk top up saldo`;
    
    bot.sendMessage(chatId, profileMessage, {
        parse_mode: 'Markdown'
    });
});

// BANTUAN
bot.onText(/❓ BANTUAN/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpMessage = `❓ *BANTUAN & PANDUAN*\n\n` +
                       `*📋 CARA PENGGUNAAN:*\n` +
                       `1. *Pendaftaran*: Isi data diri terlebih dahulu\n` +
                       `2. *Deposit*: Top up saldo member\n` +
                       `3. *Beli*: Pilih produk yang diinginkan\n` +
                       `4. *Bayar*: Gunakan saldo member\n\n` +
                       `*💰 DEPOSIT:*\n` +
                       `• Minimal: Rp 10.000\n` +
                       `• Metode: QRIS, Transfer Bank\n` +
                       `• Proses: Instan (1-5 menit)\n\n` +
                       `*🛒 PEMBELIAN:*\n` +
                       `• Pulsa & Data: Semua operator\n` +
                       `• Games: Mobile Legends, Free Fire, dll\n` +
                       `• E-Wallet: Gopay, OVO, DANA\n` +
                       `• PLN: Token listrik\n\n` +
                       `*📞 SUPPORT:*\n` +
                       `• Admin: @username_admin\n` +
                       `• WhatsApp: 08xxxxxxxxxx\n\n` +
                       `*⚠️ TROUBLESHOOTING:*\n` +
                       `• Transaksi gagal? Cek saldo & coba lagi\n` +
                       `• Saldo tidak bertambah? Hubungi admin\n` +
                       `• Produk tidak ada? Cek harga terbaru`;
    
    bot.sendMessage(chatId, helpMessage, {
        parse_mode: 'Markdown'
    });
});

// CEK HARGA REAL (dari Digiflazz)
bot.onText(/📊 CEK HARGA/, async (msg) => {
    const chatId = msg.chat.id;
    
    const loadingMsg = await bot.sendMessage(chatId, '🔄 Mengambil daftar harga terbaru dari Digiflazz...');
    
    try {
        const prices = await digiflazz.getPriceList();
        
        if (prices && prices.success && prices.data && Array.isArray(prices.data)) {
            // Filter produk pulsa saja untuk ditampilkan
            const pulseProducts = prices.data
                .filter(p => p && p.category && p.category.toLowerCase().includes('pulsa'))
                .slice(0, 8);
            
            if (pulseProducts.length > 0) {
                let message = '📋 *DAFTAR HARGA PULSA TERBARU*\n\n';
                
                pulseProducts.forEach((product, index) => {
                    const name = escapeMarkdown(product.product_name || 'Unknown');
                    const price = product.price || 0;
                    const brand = escapeMarkdown(product.brand || 'Unknown');
                    
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
        await bot.editMessageText(`❌ Error: ${error.message}`, {
            chat_id: chatId,
            message_id: loadingMsg.message_id
        });
    }
});

// HANDLE PEMBELIAN UNTUK SEMUA KATEGORI
const purchaseCategories = ['🛒 BELI PULSA', '📦 PAKET DATA', '🎮 GAMES', '💳 E-WALLET', '💡 PLN'];

purchaseCategories.forEach(category => {
    bot.onText(new RegExp(category), (msg) => {
        const chatId = msg.chat.id;
        const userBalance = getCurrentBalance(chatId);
        
        // Cek saldo minimal
        if (userBalance < 5000) {
            bot.sendMessage(chatId, `❌ *SALDO TIDAK CUKUP*\n\n` +
                                  `Saldo Anda: Rp ${userBalance.toLocaleString()}\n` +
                                  `Minimal saldo untuk transaksi: Rp 5.000\n\n` +
                                  `Silakan deposit terlebih dahulu menggunakan menu *💰 DEPOSIT*`, {
                parse_mode: 'Markdown'
            });
            return;
        }
        
        const categoryMap = {
            '🛒 BELI PULSA': { type: 'pulsa', title: 'PULSA' },
            '📦 PAKET DATA': { type: 'data', title: 'PAKET DATA' },
            '🎮 GAMES': { type: 'games', title: 'VOUCHER GAME' },
            '💳 E-WALLET': { type: 'ewallet', title: 'E-WALLET' },
            '💡 PLN': { type: 'pln', title: 'TOKEN PLN' }
        };
        
        const selected = categoryMap[category];
        userStates.set(chatId, `purchase_${selected.type}`);
        userData.set(chatId, { category: selected.type });
        
        let message = `🛒 *BELI ${selected.title}*\n\n`;
        message += `Saldo Anda: *Rp ${userBalance.toLocaleString()}*\n\n`;
        
        if (selected.type === 'pulsa' || selected.type === 'data') {
            message += `Masukkan nomor telepon:\nContoh: 081234567890`;
            userStates.set(chatId, `purchase_${selected.type}_phone`);
        } else if (selected.type === 'pln') {
            message += `Masukkan nomor meteran PLN:\nContoh: 123456789012`;
            userStates.set(chatId, `purchase_${selected.type}_phone`);
        } else {
            message += `Masukkan ID/Username game atau nomor e-wallet:`;
            userStates.set(chatId, `purchase_${selected.type}_phone`);
        }
        
        bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                keyboard: [['🚫 BATALKAN']],
                resize_keyboard: true
            }
        });
    });
});

// HANDLE INPUT NOMOR/ID UNTUK PEMBELIAN
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    if (text.startsWith('/')) return;
    
    const state = userStates.get(chatId);
    const user = userData.get(chatId);
    
    // Handle pendaftaran
    if (state === 'registration_phone') {
        if (text === '🚫 BATALKAN') {
            userStates.set(chatId, 'main_menu');
            bot.sendMessage(chatId, '❌ Pendaftaran dibatalkan.', {
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
            const profile = userProfiles.get(chatId);
            profile.phone = text;
            profile.registered = true;
            userProfiles.set(chatId, profile);
            
            userStates.set(chatId, 'main_menu');
            
            bot.sendMessage(chatId, `✅ *PENDAFTARAN BERHASIL!*\n\n` +
                                  `Selamat datang member baru! 🎉\n\n` +
                                  `📛 Nama: ${profile.name}\n` +
                                  `📞 Telepon: ${text}\n` +
                                  `💰 Bonus: Rp 5.000\n\n` +
                                  `Bonus saldo telah ditambahkan ke akun Anda.`, {
                parse_mode: 'Markdown',
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
            
            // Beri bonus saldo
            addBalance(chatId, 5000);
        } else {
            bot.sendMessage(chatId, '❌ Format nomor tidak valid! Masukkan nomor yang benar:\nContoh: 081234567890');
        }
        return;
    }
    
    // Handle deposit amount
    if (state === 'deposit_amount') {
        if (text === '🚫 BATALKAN') {
            userStates.set(chatId, 'main_menu');
            bot.sendMessage(chatId, '❌ Deposit dibatalkan.', {
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
        
        const amount = parseInt(text.replace(/[^0-9]/g, ''));
        if (isNaN(amount) || amount < 10000) {
            bot.sendMessage(chatId, '❌ Nominal tidak valid! Minimal deposit Rp 10.000\n\nMasukkan nominal yang benar:');
            return;
        }
        
        // Simpan data deposit
        userData.set(chatId, { 
            ...user, 
            depositAmount: amount,
            depositId: `DEP${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase()
        });
        userStates.set(chatId, 'deposit_method');
        
        // Tampilkan metode pembayaran
        const depositMessage = `💰 *DEPOSIT SALDO*\n\n` +
                             `Nominal: *Rp ${amount.toLocaleString()}*\n` +
                             `ID Deposit: ${userData.get(chatId).depositId}\n\n` +
                             `Pilih metode pembayaran:`;
        
        bot.sendMessage(chatId, depositMessage, {
            parse_mode: 'Markdown',
            reply_markup: {
                keyboard: [
                    ['💳 QRIS (Instant)', '🏦 Transfer Bank'],
                    ['🚫 BATALKAN']
                ],
                resize_keyboard: true
            }
        });
        return;
    }
    
    // Handle metode deposit
    if (state === 'deposit_method') {
        if (text === '🚫 BATALKAN') {
            userStates.set(chatId, 'main_menu');
            bot.sendMessage(chatId, '❌ Deposit dibatalkan.', {
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
        
        if (text === '💳 QRIS (Instant)') {
            const depositData = userData.get(chatId);
            
            // Generate QR Code (simulasi)
            const qrText = `https://your-payment-gateway.com/deposit?amount=${depositData.depositAmount}&id=${depositData.depositId}`;
            const qr_png = qr.imageSync(qrText, { type: 'png' });
            
            const depositMessage = `💰 *DEPOSIT VIA QRIS*\n\n` +
                                 `Nominal: *Rp ${depositData.depositAmount.toLocaleString()}*\n` +
                                 `ID Deposit: ${depositData.depositId}\n\n` +
                                 `*Cara Bayar:*\n` +
                                 `1. Scan QR code di bawah\n` +
                                 `2. Bayar dengan aplikasi e-wallet/banking\n` +
                                 `3. Saldo akan otomatis bertambah dalam 1-5 menit\n\n` +
                                 `⚠️ *Pastikan nominal sesuai*`;
            
            bot.sendPhoto(chatId, qr_png, {
                caption: depositMessage,
                parse_mode: 'Markdown'
            });
            
            // Simulasi konfirmasi otomatis setelah 5 detik
            setTimeout(() => {
                const newBalance = addBalance(chatId, depositData.depositAmount);
                bot.sendMessage(chatId, `✅ *DEPOSIT BERHASIL!*\n\n` +
                                      `Nominal: Rp ${depositData.depositAmount.toLocaleString()}\n` +
                                      `Saldo baru: Rp ${newBalance.toLocaleString()}\n\n` +
                                      `Terima kasih telah melakukan deposit! 🎉`, {
                    parse_mode: 'Markdown',
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
            }, 5000);
            
        } else if (text === '🏦 Transfer Bank') {
            const depositData = userData.get(chatId);
            
            const bankMessage = `💰 *DEPOSIT VIA TRANSFER BANK*\n\n` +
                              `Nominal: *Rp ${depositData.depositAmount.toLocaleString()}*\n` +
                              `ID Deposit: ${depositData.depositId}\n\n` +
                              `*Rekening Tujuan:*\n` +
                              `🏦 BCA: 1234567890 a.n. TOKO PULSA\n` +
                              `🏦 BRI: 0987654321 a.n. TOKO PULSA\n\n` +
                              `*Cara Bayar:*\n` +
                              `1. Transfer ke rekening di atas\n` +
                              `2. Screenshot bukti transfer\n` +
                              `3. Kirim ke admin untuk konfirmasi\n\n` +
                              `Saldo akan aktif setelah admin memverifikasi.`;
            
            bot.sendMessage(chatId, bankMessage, {
                parse_mode: 'Markdown'
            });
        }
        
        userStates.set(chatId, 'main_menu');
        return;
    }
    
    // Handle input nomor/ID untuk pembelian
    if (state && state.startsWith('purchase_') && state.endsWith('_phone')) {
        if (text === '🚫 BATALKAN') {
            userStates.set(chatId, 'main_menu');
            userData.delete(chatId);
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
        
        const category = state.replace('purchase_', '').replace('_phone', '');
        const products = productMap[category];
        
        if (!products) {
            bot.sendMessage(chatId, '❌ Kategori tidak valid.');
            return;
        }
        
        // Simpan nomor/ID yang diinput
        userData.set(chatId, { 
            ...user, 
            customerNo: text,
            category: category
        });
        userStates.set(chatId, `purchase_${category}_product`);
        
        // Tampilkan pilihan produk
        let message = `🛒 *PILIH PRODUK*\n\n`;
        message += `Kategori: ${category.toUpperCase()}\n`;
        message += `Tujuan: ${text}\n\n`;
        message += `Pilih produk yang diinginkan:`;
        
        // Buat keyboard inline untuk pilihan produk
        const productKeys = Object.keys(products);
        const keyboard = [];
        
        for (let i = 0; i < productKeys.length; i += 2) {
            const row = [];
            if (products[productKeys[i]]) {
                row.push({ 
                    text: products[productKeys[i]].name, 
                    callback_data: `product_${category}_${productKeys[i]}` 
                });
            }
            if (products[productKeys[i + 1]]) {
                row.push({ 
                    text: products[productKeys[i + 1]].name, 
                    callback_data: `product_${category}_${productKeys[i + 1]}` 
                });
            }
            keyboard.push(row);
        }
        keyboard.push([{ text: '🚫 Batalkan', callback_data: 'cancel' }]);
        
        bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    }
});

// HANDLE CALLBACK QUERIES (Pemilihan Produk)
bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const data = callbackQuery.data;
    
    await bot.answerCallbackQuery(callbackQuery.id);
    
    if (data === 'cancel') {
        userStates.set(chatId, 'main_menu');
        userData.delete(chatId);
        await bot.editMessageText('❌ Pembelian dibatalkan.', {
            chat_id: chatId,
            message_id: message.message_id
        });
        return;
    }
    
    // Handle pemilihan produk
    if (data.startsWith('product_')) {
        const parts = data.replace('product_', '').split('_');
        const category = parts[0];
        const productKey = parts.slice(1).join('_');
        
        const selectedProduct = productMap[category]?.[productKey];
        const user = userData.get(chatId);
        
        if (selectedProduct && user) {
            const userBalance = getCurrentBalance(chatId);
            
            if (userBalance < selectedProduct.price) {
                await bot.editMessageText(`❌ *SALDO TIDAK CUKUP*\n\n` +
                                       `Produk: ${selectedProduct.name}\n` +
                                       `Harga: Rp ${selectedProduct.price.toLocaleString()}\n` +
                                       `Saldo Anda: Rp ${userBalance.toLocaleString()}\n\n` +
                                       `Silakan deposit terlebih dahulu.`, {
                    chat_id: chatId,
                    message_id: message.message_id,
                    parse_mode: 'Markdown'
                });
                return;
            }
            
            // Tampilkan konfirmasi pembelian
            let confirmMessage = `✅ *KONFIRMASI PEMBELIAN*\n\n`;
            confirmMessage += `📦 Produk: ${selectedProduct.name}\n`;
            confirmMessage += `💵 Harga: Rp ${selectedProduct.price.toLocaleString()}\n`;
            
            if (category === 'pulsa' || category === 'data' || category === 'pln') {
                confirmMessage += `📱 Tujuan: ${user.customerNo}\n`;
            } else {
                confirmMessage += `🎯 Tujuan: ${user.customerNo}\n`;
            }
            
            confirmMessage += `💰 Saldo: Rp ${userBalance.toLocaleString()}\n\n`;
            confirmMessage += `⚠️ Pastikan data sudah benar!\n`;
            confirmMessage += `Ketik *✅ KONFIRMASI* untuk melanjutkan`;
            
            await bot.editMessageText(confirmMessage, {
                chat_id: chatId,
                message_id: message.message_id,
                parse_mode: 'Markdown'
            });
            
            userData.set(chatId, {
                ...user,
                productCode: selectedProduct.code,
                productName: selectedProduct.name,
                price: selectedProduct.price,
                category: category
            });
            userStates.set(chatId, 'waiting_purchase_confirmation');
        }
    }
});

// HANDLE KONFIRMASI PEMBELIAN
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const state = userStates.get(chatId);
    
    if (state === 'waiting_purchase_confirmation' && text === '✅ KONFIRMASI') {
        const user = userData.get(chatId);
        
        if (user) {
            // Kurangi saldo user
            const deductSuccess = deductBalance(chatId, user.price);
            if (!deductSuccess) {
                await bot.sendMessage(chatId, '❌ Saldo tidak cukup!');
                return;
            }
            
            await bot.sendMessage(chatId, `🔄 **MEMPROSES TRANSAKSI**\n\n` +
                                       `📦 Produk: ${user.productName}\n` +
                                       `💵 Harga: Rp ${user.price.toLocaleString()}\n` +
                                       `🎯 Tujuan: ${user.customerNo}\n\n` +
                                       `Tunggu sebentar...`);
            
            // Process transaction dengan Digiflazz
            const result = await digiflazz.purchase(user.productCode, user.customerNo);
            
            if (result.success) {
                const transaction = result.data;
                await bot.sendMessage(chatId, `🎉 **TRANSAKSI BERHASIL!**\n\n` +
                                           `📦 Produk: ${user.productName}\n` +
                                           `🎯 Tujuan: ${user.customerNo}\n` +
                                           `💵 Harga: Rp ${user.price.toLocaleString()}\n` +
                                           `🆔 Ref: ${result.refId}\n` +
                                           `📦 SN: ${transaction.sn || 'N/A'}\n` +
                                           `⏱️ Status: ${transaction.status}\n\n` +
                                           `Terima kasih telah berbelanja! 🛍️`);
            } else {
                // Kembalikan saldo jika gagal
                addBalance(chatId, user.price);
                await bot.sendMessage(chatId, `❌ **TRANSAKSI GAGAL**\n\n` +
                                           `📦 ${user.productName}\n` +
                                           `🎯 ${user.customerNo}\n\n` +
                                           `Error: ${result.error?.message || result.error || 'Unknown error'}\n\n` +
                                           `Saldo telah dikembalikan.`);
            }
            
            // Reset state
            userStates.set(chatId, 'main_menu');
            userData.delete(chatId);
        }
    }
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

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Pulsa Telegram Bot with Complete Features is running!',
        features: [
            'Member Registration',
            'Balance System', 
            'QRIS Deposit',
            'Pulsa & Data',
            'Games Voucher',
            'E-Wallet',
            'PLN',
            'Real-time Prices'
        ]
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        users: userProfiles.size,
        balances: userBalances.size,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`✅ Bot with complete features is live!`);
});

console.log("✅ Bot with Complete Features is running!");
