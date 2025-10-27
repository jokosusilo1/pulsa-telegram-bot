const { 
    showCategoriesMenu, 
    showPulsaProviders, 
    showCategoryProducts,
    showBuyInstructions 
} = require('../commands/products');

// Import functions dari registration
const { 
    completeRegistration, 
    cancelRegistration,
    startRegistration,
    registrationStates
} = require('../commands/registration');

// Import dari start command
const { showMainMenu } = require('../commands/start');

// Import dari commands yang sudah ada
const deposit = require('../commands/deposit');
const balance = require('../commands/balance');
const help = require('../commands/help');
const profile = require('../commands/profile');
const transaction = require('../commands/transaction');
const order = require('../commands/order');
const report = require('../commands/report');
const pin = require('../commands/pin');

function register(bot) {
    bot.on('callback_query', async (callbackQuery) => {
        const message = callbackQuery.message;
        const chatId = message.chat.id;
        const data = callbackQuery.data;
        const messageId = message.message_id;
        const user = callbackQuery.from;

        console.log(`🔘 Callback received: ${data} from ${user.first_name}`);

        try {
            // Answer callback query pertama
            await bot.answerCallbackQuery(callbackQuery.id);

            // ========== HANDLE REGISTRATION CALLBACKS ==========
            if (data === 'complete_registration') {
                await completeRegistration(bot, chatId, user);
                return;
            }
            else if (data === 'cancel_registration') {
                await cancelRegistration(bot, chatId, user.id.toString());
                return;
            }
            else if (data === 'start_registration') {
                await startRegistration(bot, chatId, user);
                return;
            }
            else if (data.startsWith('registration_back_')) {
                await handleRegistrationBack(bot, chatId, user, data);
                return;
            }
            else if (data === 'registration_edit') {
                await startRegistration(bot, chatId, user);
                return;
            }

            // ========== HANDLE PRODUCT CATEGORIES ==========
            if (data.startsWith('category_')) {
                const category = data.replace('category_', '');
                
                if (category === 'pulsa') {
                    await showPulsaProviders(bot, chatId, messageId);
                } else {
                    await showCategoryProducts(bot, chatId, messageId, category);
                }
                return;
            }
            
            else if (data.startsWith('pulsa_')) {
                const provider = data.replace('pulsa_', '');
                const properProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
                await showCategoryProducts(bot, chatId, messageId, 'pulsa', properProvider);
                return;
            }
            
            else if (data === 'back_to_categories') {
                await showCategoriesMenu(bot, chatId, messageId);
                return;
            }
            
            else if (data === 'back_to_providers') {
                await showPulsaProviders(bot, chatId, messageId);
                return;
            }
            
            else if (data === 'show_buy_instructions') {
                await showBuyInstructions(bot, chatId, messageId);
                return;
            }

            // ========== HANDLE MAIN MENU & NAVIGATION ==========
            else if (data === 'show_main_menu') {
                await showMainMenu(bot, chatId, user);
                return;
            }
            
            else if (data === 'main_menu') {
                await showMainMenu(bot, chatId, user);
                return;
            }

            // ========== HANDLE DEPOSIT & BALANCE ==========
            else if (data === 'show_deposit') {
                // Panggil fungsi dari deposit.js
                if (typeof deposit.showDeposit === 'function') {
                    await deposit.showDeposit(bot, chatId, user);
                } else if (typeof deposit === 'function') {
                    await deposit(bot, chatId, user);
                } else {
                    await showFallbackDeposit(bot, chatId, user);
                }
                return;
            }
            else if (data === 'check_balance') {
                // Panggil fungsi dari balance.js
                if (typeof balance.showBalance === 'function') {
                    await balance.showBalance(bot, chatId, user);
                } else if (typeof balance === 'function') {
                    await balance(bot, chatId, user);
                } else {
                    await showFallbackBalance(bot, chatId, user);
                }
                return;
            }
            else if (data.startsWith('deposit_')) {
                await handleDepositMethod(bot, chatId, user, data);
                return;
            }

            // ========== HANDLE HISTORY & PROFILE ==========
            else if (data === 'show_history') {
                // Panggil fungsi dari transaction.js atau report.js
                if (typeof transaction.showHistory === 'function') {
                    await transaction.showHistory(bot, chatId, user);
                } else if (typeof report.showReport === 'function') {
                    await report.showReport(bot, chatId, user);
                } else if (typeof transaction === 'function') {
                    await transaction(bot, chatId, user);
                } else {
                    await showFallbackHistory(bot, chatId, user);
                }
                return;
            }
            else if (data === 'show_profile') {
                // Panggil fungsi dari profile.js
                if (typeof profile.showProfile === 'function') {
                    await profile.showProfile(bot, chatId, user);
                } else if (typeof profile === 'function') {
                    await profile(bot, chatId, user);
                } else {
                    await showFallbackProfile(bot, chatId, user);
                }
                return;
            }

            // ========== HANDLE ORDER & TRANSACTION ==========
            else if (data.startsWith('order_')) {
                // Panggil fungsi dari order.js
                if (typeof order.handleOrder === 'function') {
                    await order.handleOrder(bot, chatId, user, data);
                } else if (typeof order === 'function') {
                    await order(bot, chatId, user, data);
                }
                return;
            }

            // ========== HANDLE PIN & SECURITY ==========
            else if (data.startsWith('pin_')) {
                // Panggil fungsi dari pin.js
                if (typeof pin.handlePin === 'function') {
                    await pin.handlePin(bot, chatId, user, data);
                } else if (typeof pin === 'function') {
                    await pin(bot, chatId, user, data);
                }
                return;
            }

            // ========== HANDLE HELP & CONTACT ==========
            else if (data === 'show_help') {
                // Panggil fungsi dari help.js
                if (typeof help.showHelp === 'function') {
                    await help.showHelp(bot, chatId, user);
                } else if (typeof help === 'function') {
                    await help(bot, chatId, user);
                } else {
                    await showFallbackHelp(bot, chatId, user);
                }
                return;
            }
            else if (data === 'show_contact') {
                await showFallbackContact(bot, chatId, user);
                return;
            }

            // ========== HANDLE UNKNOWN CALLBACK ==========
            else {
                console.log(`❌ Unknown callback: ${data}`);
                // Jangan kirim pesan error untuk menghindari spam
            }

        } catch (error) {
            console.error('❌ Callback error:', error);
            await bot.answerCallbackQuery(callbackQuery.id, { 
                text: '❌ Terjadi kesalahan, silakan coba lagi.' 
            });
        }
    });
}

// ========== REGISTRATION BACK HANDLERS ==========

async function handleRegistrationBack(bot, chatId, user, callbackData) {
    const userId = user.id.toString();
    const state = registrationStates.get(userId);
    
    if (!state) {
        await bot.sendMessage(chatId, '❌ Sesi registrasi tidak ditemukan. Silakan mulai ulang dengan /register');
        return;
    }

    let step = '';
    let message = '';
    let keyboard = {};

    switch (callbackData) {
        case 'registration_back_phone':
            step = 'phone';
            message = `📱 <b>Langkah 1: Masukkan Nomor HP</b>\n\n` +
                     `Silakan masukkan nomor HP Anda:\n` +
                     `Contoh: 08123456789`;
            keyboard = [
                [{ text: '❌ BATAL', callback_data: 'cancel_registration' }]
            ];
            break;
            
        case 'registration_back_email':
            step = 'email';
            message = `📧 <b>Langkah 2: Masukkan Email</b>\n\n` +
                     `Silakan masukkan email Anda:\n` +
                     `Contoh: nama@email.com`;
            keyboard = [
                [
                    { text: '⬅️ KEMBALI', callback_data: 'registration_back_phone' },
                    { text: '❌ BATAL', callback_data: 'cancel_registration' }
                ]
            ];
            break;
            
        case 'registration_back_pin':
            step = 'pin';
            message = `🔐 <b>Langkah 3: Buat PIN</b>\n\n` +
                     `Silakan buat PIN 6 digit:\n` +
                     `Contoh: 123456`;
            keyboard = [
                [
                    { text: '⬅️ KEMBALI', callback_data: 'registration_back_email' },
                    { text: '❌ BATAL', callback_data: 'cancel_registration' }
                ]
            ];
            break;
    }

    state.step = step;
    registrationStates.set(userId, state);

    await bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
    });
}

// ========== DEPOSIT METHOD HANDLER ==========

async function handleDepositMethod(bot, chatId, user, method) {
    try {
        let message = '';
        let keyboard = {};

        switch (method) {
            case 'deposit_bank':
                message = getBankDepositMessage();
                keyboard = getBankDepositKeyboard();
                break;
            case 'deposit_ewallet':
                message = getEWalletDepositMessage();
                keyboard = getEWalletDepositKeyboard();
                break;
            case 'deposit_qris':
                message = getQRISDepositMessage();
                keyboard = getQRISDepositKeyboard();
                break;
            default:
                message = '❌ Metode deposit tidak dikenali.';
        }

        await bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            reply_markup: keyboard
        });
    } catch (error) {
        console.error('Error handling deposit method:', error);
        await bot.sendMessage(chatId, '❌ Terjadi error saat memuat metode deposit.');
    }
}

function getBankDepositMessage() {
    return `🏦 <b>DEPOSIT VIA TRANSFER BANK</b>\n\n` +
           `Silakan transfer ke rekening berikut:\n\n` +
           `📊 <b>BANK BCA</b>\n` +
           `No. Rekening: <code>1234567890</code>\n` +
           `Atas Nama: PT. PULSA AGENT\n\n` +
           `📊 <b>BANK BRI</b>\n` +
           `No. Rekening: <code>0987654321</code>\n` +
           `Atas Nama: PT. PULSA AGENT\n\n` +
           `💡 <b>Instruksi:</b>\n` +
           `1. Transfer ke rekening di atas\n` +
           `2. Simpan bukti transfer\n` +
           `3. Saldo otomatis terupdate dalam 1-5 menit\n` +
           `4. Jika kendala, hubungi admin`;
}

function getBankDepositKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '📞 KONFIRMASI KE ADMIN', callback_data: 'show_contact' }
            ],
            [
                { text: '⬅️ KEMBALI KE DEPOSIT', callback_data: 'show_deposit' }
            ]
        ]
    };
}

function getEWalletDepositMessage() {
    return `📱 <b>DEPOSIT VIA E-WALLET</b>\n\n` +
           `Silakan transfer ke e-wallet berikut:\n\n` +
           `📊 <b>OVO</b>\n` +
           `No. Telepon: <code>08123456789</code>\n` +
           `Atas Nama: AGENT PULSA\n\n` +
           `📊 <b>GOPAY</b>\n` +
           `No. Telepon: <code>08123456789</code>\n` +
           `Atas Nama: AGENT PULSA\n\n` +
           `💡 <b>Instruksi:</b>\n` +
           `1. Transfer ke e-wallet di atas\n` +
           `2. Simpan bukti transfer\n` +
           `3. Saldo otomatis terupdate dalam 1-3 menit\n` +
           `4. Jika kendala, hubungi admin`;
}

function getEWalletDepositKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '📞 KONFIRMASI KE ADMIN', callback_data: 'show_contact' }
            ],
            [
                { text: '⬅️ KEMBALI KE DEPOSIT', callback_data: 'show_deposit' }
            ]
        ]
    };
}

function getQRISDepositMessage() {
    return `📸 <b>DEPOSIT VIA QRIS</b>\n\n` +
           `Fitur QRIS sedang dalam pengembangan.\n\n` +
           `💡 <b>Fitur akan segera hadir:</b>\n` +
           `• Scan QR Code untuk deposit\n` +
           `• Support semua bank & e-wallet\n` +
           `• Proses instan & otomatis`;
}

function getQRISDepositKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '🏦 TRANSFER BANK', callback_data: 'deposit_bank' },
                { text: '📱 E-WALLET', callback_data: 'deposit_ewallet' }
            ],
            [
                { text: '⬅️ KEMBALI KE DEPOSIT', callback_data: 'show_deposit' }
            ]
        ]
    };
}

// ========== FALLBACK HANDLERS ==========

async function showFallbackDeposit(bot, chatId, user) {
    const message = `💳 <b>DEPOSIT SALDO</b>\n\n` +
                   `Fitur deposit sedang dalam pengembangan.\n\n` +
                   `💡 <b>Segera hadir:</b>\n` +
                   `• Transfer Bank (BCA, BRI, BNI, Mandiri)\n` +
                   `• E-Wallet (OVO, Gopay, Dana)\n` +
                   `• QRIS Instant`;

    await bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '⬅️ KEMBALI', callback_data: 'show_main_menu' }]
            ]
        }
    });
}

async function showFallbackBalance(bot, chatId, user) {
    const message = `💰 <b>CEK SALDO</b>\n\n` +
                   `Fitur cek saldo sedang dalam pengembangan.\n\n` +
                   `💡 <b>Segera hadir:</b>\n` +
                   `• Lihat saldo real-time\n` +
                   `• Riwayat transaksi\n` +
                   `• Notifikasi saldo hampir habis`;

    await bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '⬅️ KEMBALI', callback_data: 'show_main_menu' }]
            ]
        }
    });
}

async function showFallbackHistory(bot, chatId, user) {
    const message = `📋 <b>RIWAYAT TRANSAKSI</b>\n\n` +
                   `Fitur riwayat transaksi sedang dalam pengembangan.\n\n` +
                   `💡 <b>Segera hadir:</b>\n` +
                   `• Riwayat pembelian pulsa\n` +
                   `• Riwayat deposit\n` +
                   `• Filter berdasarkan tanggal`;

    await bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '⬅️ KEMBALI', callback_data: 'show_main_menu' }]
            ]
        }
    });
}

async function showFallbackProfile(bot, chatId, user) {
    const message = `👤 <b>PROFIL AGENT</b>\n\n` +
                   `Fitur profil sedang dalam pengembangan.\n\n` +
                   `💡 <b>Segera hadir:</b>\n` +
                   `• Data pribadi agent\n` +
                   `• Saldo dan limit\n` +
                   `• Pengaturan akun`;

    await bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '⬅️ KEMBALI', callback_data: 'show_main_menu' }]
            ]
        }
    });
}

async function showFallbackHelp(bot, chatId, user) {
    const message = `📋 <b>BANTUAN & PANDUAN</b>\n\n` +
                   `Berikut panduan penggunaan bot:\n\n` +
                   `🔹 <b>Cara Registrasi:</b>\n` +
                   `Gunakan perintah /register\n\n` +
                   `🔹 <b>Cara Beli Pulsa:</b>\n` +
                   `1. Pilih "BELI PULSA/DATA"\n` +
                   `2. Pilih jenis produk\n` +
                   `3. Ikuti instruksi\n\n` +
                   `🔹 <b>Problem?</b>\n` +
                   `Hubungi admin dengan "KONTAK ADMIN"`;

    await bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📞 KONTAK ADMIN', callback_data: 'show_contact' }
                ],
                [
                    { text: '⬅️ KEMBALI', callback_data: 'show_main_menu' }
                ]
            ]
        }
    });
}

async function showFallbackContact(bot, chatId, user) {
    const message = `📞 <b>KONTAK ADMIN</b>\n\n` +
                   `Butuh bantuan? Hubungi admin kami:\n\n` +
                   `👨‍💼 <b>Admin 1</b>\n` +
                   `📱 WhatsApp: 08123456789\n` +
                   `📧 Email: admin1@pulsaagent.com\n\n` +
                   `👨‍💼 <b>Admin 2</b>\n` +
                   `📱 WhatsApp: 087654321098\n` +
                   `📧 Email: admin2@pulsaagent.com\n\n` +
                   `⏰ <b>Jam Operasional:</b>\n` +
                   `Senin - Minggu: 08:00 - 22:00 WIB`;

    await bot.sendMessage(chatId, message, { 
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '⬅️ KEMBALI', callback_data: 'show_main_menu' }]
            ]
        }
    });
}

module.exports = { register };