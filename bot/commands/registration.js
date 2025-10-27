const AgentService = require('../services/AgentService');
const ApiService = require('../services/ApiService');

// Temporary storage untuk state registrasi
const registrationStates = new Map();

module.exports = (bot) => {
    console.log('🔄 Loading registration command...');

    bot.onText(/\/register|📝 DAFTAR SEKARANG/, async (msg) => {
        const chatId = msg.chat.id;
        const user = msg.from;
        
        await startRegistration(bot, chatId, user);
    });

    // Handle registration steps
    bot.on('message', async (msg) => {
        if (!msg.text) return;
        
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const text = msg.text;
        const messageId = msg.message_id; // Dapatkan ID pesan user

        // Skip jika command
        if (text.startsWith('/')) return;

        if (registrationStates.has(userId)) {
            // Hapus pesan input user
            try {
                await bot.deleteMessage(chatId, messageId);
                console.log(`🗑️ Deleted user input message: ${text}`);
            } catch (error) {
                console.log('⚠️ Could not delete user message (maybe too old)');
            }
            
            await handleRegistrationStep(bot, chatId, userId, msg.from, text);
        }
    });

    // Handle callback queries untuk registrasi
    bot.on('callback_query', async (callbackQuery) => {
        const data = callbackQuery.data;
        const chatId = callbackQuery.message.chat.id;
        const messageId = callbackQuery.message.message_id;
        const user = callbackQuery.from;
        const userId = user.id.toString();

        console.log(`🔘 Registration callback: ${data}`);

        try {
            switch (data) {
                case 'cancel_registration':
                    await cancelRegistration(bot, chatId, userId, messageId);
                    break;
                    
                case 'registration_back_phone':
                    await handleRegistrationBack(bot, chatId, userId, 'phone', messageId);
                    break;
                    
                case 'registration_back_email':
                    await handleRegistrationBack(bot, chatId, userId, 'email', messageId);
                    break;
                    
                case 'registration_back_pin':
                    await handleRegistrationBack(bot, chatId, userId, 'pin', messageId);
                    break;
                    
                case 'complete_registration':
                    await completeRegistration(bot, chatId, user, messageId);
                    break;
                    
                case 'registration_edit':
                    await startRegistration(bot, chatId, user);
                    break;
            }

            await bot.answerCallbackQuery(callbackQuery.id);
        } catch (error) {
            console.error('Error handling registration callback:', error);
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: '❌ Terjadi error, silakan coba lagi.'
            });
        }
    });
};

// Start registrasi
async function startRegistration(bot, chatId, user) {
    const userId = user.id.toString();
    
    try {
        // Cek apakah sudah terdaftar
        const isRegistered = await AgentService.checkAgentRegistration(userId);
        if (isRegistered) {
            await bot.sendMessage(chatId, 
                '✅ Anda sudah terdaftar sebagai agent!\n\n' +
                'Gunakan /start untuk mengakses menu utama.'
            );
            return;
        }

        // Hapus state lama jika ada
        if (registrationStates.has(userId)) {
            registrationStates.delete(userId);
        }

        const message = `📝 <b>PENDAFTARAN AGENT PPOB</b>\n\n` +
                       `Silakan lengkapi data diri Anda:\n\n` +
                       `📱 <b>Langkah 1: Masukkan Nomor HP</b>\n` +
                       `Contoh: 08123456789\n\n` +
                       `Pastikan nomor HP aktif untuk transaksi dan verifikasi`;

        // Kirim pesan pertama dan simpan messageId
        const sentMessage = await bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '❌ BATAL', callback_data: 'cancel_registration' }
                    ]
                ]
            }
        });

        // Simpan state dengan messageId
        registrationStates.set(userId, {
            step: 'phone',
            data: {
                name: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
                username: user.username || '',
                telegramId: userId
            },
            messageId: sentMessage.message_id
        });

    } catch (error) {
        console.error('Error starting registration:', error);
        await bot.sendMessage(chatId, '❌ Terjadi kesalahan saat memulai pendaftaran.');
    }
}

// Handle registration steps dengan edit pesan yang sama
async function handleRegistrationStep(bot, chatId, userId, user, text) {
    const state = registrationStates.get(userId);
    if (!state) return;
    
    try {
        switch (state.step) {
            case 'phone':
                await handlePhoneInput(bot, chatId, userId, text, state);
                break;
            case 'email':
                await handleEmailInput(bot, chatId, userId, text, state);
                break;
            case 'pin':
                await handlePinInput(bot, chatId, userId, text, state);
                break;
            case 'confirm_pin':
                await handleConfirmPin(bot, chatId, userId, text, state);
                break;
            default:
                await bot.sendMessage(chatId, '❌ Step registrasi tidak dikenali. Silakan mulai ulang dengan /register');
                registrationStates.delete(userId);
        }
    } catch (error) {
        console.error('Error in registration step:', error);
        await bot.sendMessage(chatId, '❌ Terjadi kesalahan. Silakan mulai pendaftaran ulang dengan /register');
        registrationStates.delete(userId);
    }
}

// Handle phone input - EDIT pesan yang sama
async function handlePhoneInput(bot, chatId, userId, text, state) {
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(text)) {
        const errorMessage = `❌ <b>Format nomor telepon tidak valid!</b>\n\n` +
                           `Silakan kirim nomor telepon yang valid.\n` +
                           `Contoh: 08123456789\n\n` +
                           `📱 <b>Langkah 1: Masukkan Nomor HP</b>`;
        
        await bot.editMessageText(errorMessage, {
            chat_id: chatId,
            message_id: state.messageId,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '❌ BATAL', callback_data: 'cancel_registration' }
                    ]
                ]
            }
        });
        return;
    }

    // Update state
    state.data.phone = text;
    state.step = 'email';
    registrationStates.set(userId, state);

    const message = `✅ <b>Nomor HP Terverifikasi: ${text}</b>\n\n` +
                   `📧 <b>Langkah 2: Masukkan Email</b>\n` +
                   `Contoh: nama@email.com\n\n` +
                   `Email akan digunakan untuk notifikasi dan reset PIN`;

    await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: state.messageId,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⬅️ KEMBALI', callback_data: 'registration_back_phone' },
                    { text: '❌ BATAL', callback_data: 'cancel_registration' }
                ]
            ]
        }
    });
}

// Handle email input - EDIT pesan yang sama
async function handleEmailInput(bot, chatId, userId, text, state) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
        const errorMessage = `❌ <b>Format email tidak valid!</b>\n\n` +
                           `Silakan kirim email yang valid.\n` +
                           `Contoh: nama@email.com\n\n` +
                           `📧 <b>Langkah 2: Masukkan Email</b>`;
        
        await bot.editMessageText(errorMessage, {
            chat_id: chatId,
            message_id: state.messageId,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '⬅️ KEMBALI', callback_data: 'registration_back_phone' },
                        { text: '❌ BATAL', callback_data: 'cancel_registration' }
                    ]
                ]
            }
        });
        return;
    }

    // Update state
    state.data.email = text.toLowerCase();
    state.step = 'pin';
    registrationStates.set(userId, state);

    const message = `✅ <b>Email Terverifikasi: ${text}</b>\n\n` +
                   `🔐 <b>Langkah 3: Buat PIN</b>\n` +
                   `Buat PIN 6 digit angka untuk keamanan akun\n\n` +
                   `Contoh: 123456\n\n` +
                   `⚠️ <b>Peringatan:</b>\n` +
                   `Jangan berikan PIN kepada siapapun!`;

    await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: state.messageId,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⬅️ KEMBALI', callback_data: 'registration_back_email' },
                    { text: '❌ BATAL', callback_data: 'cancel_registration' }
                ]
            ]
        }
    });
}

// Handle PIN input - EDIT pesan yang sama
async function handlePinInput(bot, chatId, userId, text, state) {
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(text)) {
        const errorMessage = `❌ <b>PIN harus 6 digit angka!</b>\n\n` +
                           `Silakan buat PIN 6 digit.\n` +
                           `Contoh: 123456\n\n` +
                           `🔐 <b>Langkah 3: Buat PIN</b>`;
        
        await bot.editMessageText(errorMessage, {
            chat_id: chatId,
            message_id: state.messageId,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '⬅️ KEMBALI', callback_data: 'registration_back_email' },
                        { text: '❌ BATAL', callback_data: 'cancel_registration' }
                    ]
                ]
            }
        });
        return;
    }

    // Validasi PIN lemah
    if (isWeakPin(text)) {
        const errorMessage = `❌ <b>PIN terlalu lemah!</b>\n\n` +
                           `PIN tidak boleh:\n` +
                           `• Berurutan (123456, 654321)\n` +
                           `• Angka sama semua (111111, 000000)\n` +
                           `• Tanggal lahir\n\n` +
                           `Silakan buat PIN yang lebih kuat.`;
        
        await bot.editMessageText(errorMessage, {
            chat_id: chatId,
            message_id: state.messageId,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '⬅️ KEMBALI', callback_data: 'registration_back_email' },
                        { text: '❌ BATAL', callback_data: 'cancel_registration' }
                    ]
                ]
            }
        });
        return;
    }

    // Update state
    state.data.pin = text;
    state.data.confirmPin = '';
    state.step = 'confirm_pin';
    registrationStates.set(userId, state);

    const message = `✅ <b>PIN Diterima</b>\n\n` +
                   `🔐 <b>Langkah 4: Konfirmasi PIN</b>\n` +
                   `Ketik ulang PIN yang sama untuk konfirmasi\n\n` +
                   `PIN: ••••••`;

    await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: state.messageId,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⬅️ KEMBALI', callback_data: 'registration_back_pin' },
                    { text: '❌ BATAL', callback_data: 'cancel_registration' }
                ]
            ]
        }
    });
}

// Handle confirm PIN - EDIT pesan yang sama
async function handleConfirmPin(bot, chatId, userId, text, state) {
    if (text !== state.data.pin) {
        const errorMessage = `❌ <b>PIN tidak cocok!</b>\n\n` +
                           `Silakan ketik ulang PIN yang sama.`;
        
        await bot.editMessageText(errorMessage, {
            chat_id: chatId,
            message_id: state.messageId,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '⬅️ KEMBALI', callback_data: 'registration_back_pin' },
                        { text: '❌ BATAL', callback_data: 'cancel_registration' }
                    ]
                ]
            }
        });
        return;
    }

    // Update state
    state.data.confirmPin = text;
    registrationStates.set(userId, state);

    // Tampilkan konfirmasi data
    await showRegistrationConfirmation(bot, chatId, userId, state.data, state.messageId);
}

// Tampilkan konfirmasi data - EDIT pesan yang sama
async function showRegistrationConfirmation(bot, chatId, userId, data, messageId) {
    const message = `📋 <b>KONFIRMASI DATA PENDAFTARAN</b>\n\n` +
                   `Harap periksa data Anda sebelum menyimpan:\n\n` +
                   `👤 <b>Data Pribadi:</b>\n` +
                   `• Nama: ${data.name}\n` +
                   `• Telegram: @${data.username || 'Tidak ada'}\n\n` +
                   `📞 <b>Kontak:</b>\n` +
                   `• Telepon: ${data.phone}\n` +
                   `• Email: ${data.email}\n\n` +
                   `🔐 <b>Keamanan:</b>\n` +
                   `• PIN: ••••••\n\n` +
                   `✅ Apakah data sudah benar?`;

    await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '✅ SIMPAN DATA', callback_data: 'complete_registration' },
                    { text: '✏️ EDIT ULANG', callback_data: 'registration_edit' }
                ],
                [
                    { text: '❌ BATAL', callback_data: 'cancel_registration' }
                ]
            ]
        }
    });
}

// Proses penyelesaian registrasi - OTOMATIS KE MENU UTAMA
// Proses penyelesaian registrasi - OTOMATIS KE MENU UTAMA
async function completeRegistration(bot, chatId, userData, messageId) {
    try {
        const userId = userData.id.toString();
        const state = registrationStates.get(userId);
        
        if (!state) {
            await bot.sendMessage(chatId, '❌ Data registrasi tidak ditemukan. Silakan mulai ulang dengan /register');
            return;
        }

        // Buat agent di database
        const agentData = {
            telegramId: userId,
            name: state.data.name,
            phone: state.data.phone,
            email: state.data.email,
            pin: state.data.pin,
            username: state.data.username,
            role: 'agent',
            balance: 0, // Saldo awal
            isRegistered: true,
            registeredAt: new Date().toISOString()
        };

        console.log('📝 Creating agent with data:', agentData);

        const agent = await AgentService.createAgent(agentData);
        
        // Hapus state
        registrationStates.delete(userId);

        const successMessage = `🎉 <b>PENDAFTARAN BERHASIL!</b>\n\n` +
                              `Selamat ${agent.name}! \n` +
                              `Akun agent Anda telah berhasil didaftarkan.\n\n` +
                              `✅ <b>Data Agent:</b>\n` +
                              `• Nama: ${agent.name}\n` +
                              `• Telepon: ${agent.phone}\n` +
                              `• Email: ${agent.email}\n` +
                              `• Role: ${agent.role}\n\n` +
                              `💰 <b>Saldo Awal:</b> Rp ${agent.balance.toLocaleString('id-ID')}\n\n` +
                              `⏳ <i>Mengarahkan ke menu utama...</i>`;

        // Edit pesan menjadi sukses
        await bot.editMessageText(successMessage, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML'
        });

        // TUNGGU SEBENTAR lalu tampilkan menu utama
        setTimeout(async () => {
            try {
                const { showMainMenu } = require('./start');
                await showMainMenu(bot, chatId, userData);
                console.log(`✅ Auto-redirected to main menu for: ${userData.first_name}`);
            } catch (error) {
                console.error('Error showing main menu after registration:', error);
                await bot.sendMessage(chatId, 
                    '✅ Registrasi berhasil! Gunakan /start untuk mengakses menu utama.'
                );
            }
        }, 2000); // Tunggu 2 detik
        
    } catch (error) {
        console.error('Error completing registration:', error);
        
        let errorMessage = '❌ <b>Gagal menyelesaikan pendaftaran.</b>\n\nSilakan coba lagi atau hubungi admin.';
        
        if (error.code === 11000) {
            errorMessage = '❌ <b>Nomor telepon atau Telegram ID sudah terdaftar!</b>\n\nSilakan gunakan data yang berbeda atau hubungi admin.';
        }

        await bot.editMessageText(errorMessage, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📝 COBA LAGI', callback_data: 'start_registration' }
                    ]
                ]
            }
        });
    }
}
// Batalkan pendaftaran - EDIT pesan yang sama
async function cancelRegistration(bot, chatId, userId = null, messageId = null) {
    if (userId) {
        registrationStates.delete(userId);
    }
    
    const message = `❌ <b>Pendaftaran Dibatalkan</b>\n\n` +
                   `Anda dapat mendaftar kapan saja dengan mengirim perintah /register\n\n` +
                   `Terima kasih!`;

    if (messageId) {
        await bot.editMessageText(message, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML'
        });
    } else {
        await bot.sendMessage(chatId, message, { 
            parse_mode: 'HTML'
        });
    }
}

// Handle back navigation
async function handleRegistrationBack(bot, chatId, userId, step, messageId) {
    const state = registrationStates.get(userId);
    
    if (!state) {
        await bot.sendMessage(chatId, '❌ Sesi registrasi tidak ditemukan. Silakan mulai ulang dengan /register');
        return;
    }

    state.step = step;
    registrationStates.set(userId, state);

    let message = '';
    let keyboard = {};

    switch (step) {
        case 'phone':
            message = `📱 <b>Langkah 1: Masukkan Nomor HP</b>\n\n` +
                     `Silakan masukkan nomor HP Anda:\n` +
                     `Contoh: 08123456789`;
            keyboard = [
                [
                    { text: '❌ BATAL', callback_data: 'cancel_registration' }
                ]
            ];
            break;
            
        case 'email':
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
            
        case 'pin':
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

    await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
}

// Helper function untuk cek PIN lemah
function isWeakPin(pin) {
    if (/^(\d)\1{5}$/.test(pin)) return true;
    if ('0123456789'.includes(pin)) return true;
    if ('9876543210'.includes(pin)) return true;
    
    const weakPatterns = [
        '123456', '654321', '111111', '000000', 
        '222222', '333333', '444444', '555555',
        '666666', '777777', '888888', '999999'
    ];
    
    return weakPatterns.includes(pin);
}

// ========== CALLBACK HANDLERS ==========

// Handler untuk callback query registration
async function handleRegistrationCallback(bot, callbackQuery) {
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const user = callbackQuery.from;
    const userId = user.id.toString();

    console.log(`🔘 Registration callback: ${data}`);

    try {
        const state = registrationStates.get(userId);

        switch (data) {
            case 'cancel_registration':
                await cancelRegistration(bot, chatId, userId, messageId);
                break;

            case 'registration_back_phone':
                if (state) {
                    state.step = 'phone';
                    registrationStates.set(userId, state);
                    await bot.editMessageText('📱 <b>Langkah 1: Masukkan Nomor HP</b>\n\nSilakan masukkan nomor HP Anda:', {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '❌ BATAL', callback_data: 'cancel_registration' }
                                ]
                            ]
                        }
                    });
                }
                break;

            case 'registration_back_email':
                if (state) {
                    state.step = 'email';
                    registrationStates.set(userId, state);
                    await bot.editMessageText('📧 <b>Langkah 2: Masukkan Email</b>\n\nSilakan masukkan email Anda:', {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '⬅️ KEMBALI', callback_data: 'registration_back_phone' },
                                    { text: '❌ BATAL', callback_data: 'cancel_registration' }
                                ]
                            ]
                        }
                    });
                }
                break;

            case 'registration_back_pin':
                if (state) {
                    state.step = 'pin';
                    registrationStates.set(userId, state);
                    await bot.editMessageText('🔐 <b>Langkah 3: Buat PIN</b>\n\nSilakan buat PIN 6 digit:', {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '⬅️ KEMBALI', callback_data: 'registration_back_email' },
                                    { text: '❌ BATAL', callback_data: 'cancel_registration' }
                                ]
                            ]
                        }
                    });
                }
                break;

            case 'complete_registration':
                await completeRegistration(bot, chatId, user, messageId);
                break;

            case 'registration_edit':
                await startRegistration(bot, chatId, user);
                break;

            case 'start_registration':
                await startRegistration(bot, chatId, user);
                break;
        }

        await bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
        console.error('Error handling registration callback:', error);
        await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Terjadi error, silakan coba lagi.'
        });
    }
}

// ========== EXPORT MODULE ==========

module.exports = {
    // Fungsi untuk dipanggil di index.js
    setupRegistration: function(bot) {
        console.log('🔄 Setting up registration command...');

        // Handle /register command
        bot.onText(/\/register|📝 DAFTAR SEKARANG/, async (msg) => {
            const chatId = msg.chat.id;
            const user = msg.from;
            await startRegistration(bot, chatId, user);
        });

        // Handle registration steps (text messages)
        bot.on('message', async (msg) => {
            if (!msg.text) return;
            
            const chatId = msg.chat.id;
            const userId = msg.from.id.toString();
            const text = msg.text;

            if (text.startsWith('/')) return;

            if (registrationStates.has(userId)) {
                // Hapus pesan input user
                try {
                    await bot.deleteMessage(chatId, msg.message_id);
                    console.log(`🗑️ Deleted user input: ${text.substring(0, 20)}...`);
                } catch (error) {
                    console.log('⚠️ Could not delete user message');
                }
                
                await handleRegistrationStep(bot, chatId, userId, msg.from, text);
            }
        });

        // Handle registration callbacks
        bot.on('callback_query', async (callbackQuery) => {
            const data = callbackQuery.data;
            
            // Jika callback terkait registrasi, handle di sini
            if (data.includes('registration_') || 
                data.includes('cancel_registration') || 
                data === 'complete_registration' ||
                data === 'start_registration') {
                await handleRegistrationCallback(bot, callbackQuery);
            }
            // Biarkan callback lainnya ditangani oleh handler utama
        });

        return bot;
    },
    
    // Export functions yang diperlukan
    startRegistration,
    completeRegistration,
    cancelRegistration,
    registrationStates,
    
    // checkAndRedirect untuk start.js
    checkAndRedirect: async function(bot, chatId, user) {
        try {
            const userId = user.id.toString();
            const isRegistered = await AgentService.checkAgentRegistration(userId);
            
            if (isRegistered) {
                const { showMainMenu } = require('./start');
                await showMainMenu(bot, chatId, user);
                return true;
            } else {
                await bot.sendMessage(chatId, 
                    `👋 Halo ${user.first_name}! Selamat datang di Bot Pulsa Agent.\n\n` +
                    `📝 Anda perlu registrasi terlebih dahulu untuk menggunakan layanan.\n\n` +
                    `Ketik: /register [Nama Lengkap] [Nomor HP]\n` +
                    `Contoh: /register ${user.first_name} 081234567890`
                );
                return false;
            }
        } catch (error) {
            console.error('Error in checkAndRedirect:', error);
            await bot.sendMessage(chatId, '❌ Terjadi error, silakan coba lagi.');
            return false;
        }
    }
};