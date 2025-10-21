const path = require('path');
const AgentStorage = require('./storage/AgentStorage');

module.exports = (bot) => {
    console.log("🔄 Loading /start command...");

    // Command /start
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        try {
            const agent = AgentStorage.getAgent(userId);
            
            if (!agent) {
                showRegistrationFirst(bot, chatId, msg.from);
            } else {
                showMainMenuRegistered(bot, chatId, agent);
            }

        } catch (error) {
            console.error('Error in /start:', error);
            bot.sendMessage(chatId, '❌ Terjadi kesalahan. Silakan coba lagi.');
        }
    });

    // Handler untuk semua pesan
    bot.on('message', async (msg) => {
        if (!msg.text) return;
        
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const text = msg.text;

        try {
            if (text === '📝 DAFTAR SEKARANG') {
                startRegistration(bot, chatId, msg.from);
            }
            else if (text === '🏠 MENU UTAMA') {
                const agent = AgentStorage.getAgent(userId);
                if (agent) {
                    showMainMenuRegistered(bot, chatId, agent);
                } else {
                    showRegistrationFirst(bot, chatId, msg.from);
                }
            }
            else if (text === 'ℹ️ INFO BISNIS') {
                showBusinessInfo(bot, chatId);
            }
            else if (text === '📞 HUBUNGI CS') {
                showContactCS(bot, chatId);
            }
            else if (AgentStorage.getRegistrationState(userId)) {
                await handleRegistrationStep(bot, chatId, userId, msg.from, text);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    // Command /profile
    bot.onText(/\/profile/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        try {
            const agent = AgentStorage.getAgent(userId);
            if (!agent) {
                return bot.sendMessage(chatId, '❌ Anda belum terdaftar sebagai agent.');
            }

            const profileMessage = `👤 PROFILE AGENT

📛 Nama: ${agent.name}
🆔 Agent ID: ${agent.agentId}
📱 Telepon: ${agent.phone}
📧 Email: ${agent.email}
💰 Saldo: Rp ${agent.balance.toLocaleString('id-ID')}
📊 Status: ${agent.status}
📅 Terdaftar: ${new Date(agent.createdAt).toLocaleDateString('id-ID')}

🔐 Keamanan:
• PIN: ********
• Verifikasi: ${agent.verified ? '✅' : '❌'}`;

            bot.sendMessage(chatId, profileMessage);
        } catch (error) {
            console.error('Error in /profile:', error);
            bot.sendMessage(chatId, '❌ Gagal mengambil data profile.');
        }
    });

    console.log("✅ /start command loaded");
};

// ✅ FUNGSI HELPER - SEMUA HARUS ADA

function startRegistration(bot, chatId, user) {
    const userId = user.id.toString();
    
    // Initialize registration state
    AgentStorage.saveRegistrationState(userId, {
        step: 'phone',
        data: {
            name: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
            username: user.username || '',
            telegramId: userId
        }
    });

    const message = `📝 PENDAFTARAN AGENT PPOB

Silakan lengkapi data diri Anda:

📱 Langkah 1: Masukkan Nomor HP
Contoh: 08123456789

Pastikan nomor HP aktif untuk transaksi dan verifikasi`;

    bot.sendMessage(chatId, message);
}

// ✅ HANDLE SETIAP STEP PENDAFTARAN
async function handleRegistrationStep(bot, chatId, userId, user, text) {
    const state = AgentStorage.getRegistrationState(userId);
    
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
        }
    } catch (error) {
        console.error('Error in registration step:', error);
        bot.sendMessage(chatId, '❌ Terjadi kesalahan. Silakan mulai pendaftaran ulang dengan /start');
        AgentStorage.deleteRegistrationState(userId);
    }
}

// ✅ STEP 1: INPUT NOMOR HP
async function handlePhoneInput(bot, chatId, userId, text, state) {
    // Validasi nomor HP
    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(text)) {
        return bot.sendMessage(chatId, 
            '❌ Format nomor HP tidak valid.\n\n' +
            'Contoh: 08123456789\n' +
            'Minimal 10 digit, maksimal 13 digit angka.\n\n' +
            'Silakan masukkan kembali:'
        );
    }

    // Cek apakah nomor HP sudah terdaftar
    if (AgentStorage.isPhoneRegistered(text)) {
        return bot.sendMessage(chatId, 
            '❌ Nomor HP sudah terdaftar.\n\n' +
            'Silakan gunakan nomor HP lain:'
        );
    }

    // Simpan nomor HP dan lanjut ke step email
    state.data.phone = text;
    state.step = 'email';
    AgentStorage.saveRegistrationState(userId, state);

    const message = `✅ Nomor HP Disimpan: ${text}

📧 Langkah 2: Masukkan Email
Contoh: nama@email.com

Email digunakan untuk notifikasi transaksi dan reset PIN`;

    bot.sendMessage(chatId, message);
}

// ✅ STEP 2: INPUT EMAIL
async function handleEmailInput(bot, chatId, userId, text, state) {
    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
        return bot.sendMessage(chatId, 
            '❌ Format email tidak valid.\n\n' +
            'Contoh: nama@email.com\n\n' +
            'Silakan masukkan kembali:'
        );
    }

    // Cek apakah email sudah terdaftar
    if (AgentStorage.isEmailRegistered(text)) {
        return bot.sendMessage(chatId, 
            '❌ Email sudah terdaftar.\n\n' +
            'Silakan gunakan email lain:'
        );
    }

    // Simpan email dan lanjut ke step PIN
    state.data.email = text;
    state.step = 'pin';
    AgentStorage.saveRegistrationState(userId, state);

    const message = `✅ Email Disimpan: ${text}

🔐 Langkah 3: Buat PIN
Masukkan 6 digit angka untuk PIN Anda.

PIN digunakan untuk otorisasi transaksi penting`;

    bot.sendMessage(chatId, message);
}

// ✅ STEP 3: INPUT PIN
async function handlePinInput(bot, chatId, userId, text, state) {
    // Validasi PIN (6 digit angka)
    const pinRegex = /^[0-9]{6}$/;
    if (!pinRegex.test(text)) {
        return bot.sendMessage(chatId, 
            '❌ PIN harus 6 digit angka.\n\n' +
            'Contoh: 123456\n\n' +
            'Silakan masukkan PIN 6 digit:'
        );
    }

    // Simpan PIN sementara dan minta konfirmasi
    state.tempPin = text;
    state.step = 'confirm_pin';
    AgentStorage.saveRegistrationState(userId, state);

    const message = `🔐 Konfirmasi PIN
Masukkan kembali PIN Anda untuk konfirmasi:

${text.replace(/./g, '•')}`;

    bot.sendMessage(chatId, message);
}

// ✅ STEP 4: KONFIRMASI PIN
async function handleConfirmPin(bot, chatId, userId, text, state) {
    // Validasi konfirmasi PIN
    if (text !== state.tempPin) {
        state.step = 'pin';
        state.tempPin = null;
        AgentStorage.saveRegistrationState(userId, state);

        return bot.sendMessage(chatId, 
            '❌ PIN tidak cocok.\n\n' +
            'Silakan buat PIN kembali:'
        );
    }

    // PIN cocok, selesaikan pendaftaran
    const agentData = {
        ...state.data,
        pin: text,
        agentId: 'A' + Date.now().toString().slice(-6),
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        verified: false
    };

    // SIMPAN KE SHARED STORAGE
    AgentStorage.saveAgent(userId, agentData);

    // Hapus state pendaftaran
    AgentStorage.deleteRegistrationState(userId);

    // Tampilkan success message
    await showRegistrationSuccess(bot, chatId, agentData);
}

// ✅ TAMPILKAN HASIL PENDAFTARAN BERHASIL
async function showRegistrationSuccess(bot, chatId, agentData) {
    const successMessage = `🎉 PENDAFTARAN BERHASIL!

Selamat! Anda sekarang terdaftar sebagai Agent PPOB.

👤 Data Agent:
• Nama: ${agentData.name}
• ID Agent: ${agentData.agentId}
• Telepon: ${agentData.phone}
• Email: ${agentData.email}
• Status: ✅ Aktif
• Saldo: Rp 0

🔐 Keamanan:
• PIN Anda telah disimpan dengan aman
• Gunakan PIN untuk otorisasi transaksi

🚀 Mulai Berbisnis:
1. Deposit saldo terlebih dahulu
2. Pilih produk yang ingin dijual  
3. Lakukan order untuk customer
4. Gunakan PIN untuk konfirmasi transaksi

Saldo awal Rp 0, silakan deposit untuk mulai transaksi`;

    const keyboard = {
        reply_markup: {
            keyboard: [
                ["💰 DEPOSIT SALDO", "📱 BELI PULSA"],
                ["👤 PROFILE AGENT", "🔐 GANTI PIN"],
                ["🏠 MENU UTAMA"]
            ],
            resize_keyboard: true
        }
    };

    await bot.sendMessage(chatId, successMessage, {
        ...keyboard
    });
}

// ✅ TAMPILKAN UNTUK USER BARU
function showRegistrationFirst(bot, chatId, user) {
    const welcomeMessage = `🤖 SELAMAT DATANG!

Anda belum terdaftar sebagai agent. 
Daftar sekarang untuk mulai berbisnis pulsa & PPOB!

📋 Data yang Dibutuhkan:
• 📱 Nomor HP (untuk transaksi)
• 📧 Email (untuk notifikasi)  
• 🔐 PIN 6 digit (untuk keamanan)

🎁 Keuntungan Jadi Agent:
• 💰 Dapat komisi setiap transaksi
• 📈 Akses semua produk terupdate  
• 🚀 Proses order cepat
• 📊 Laporan real-time
• 🎯 Support 24/7

Gratis - Tidak ada biaya pendaftaran`;

    const keyboard = {
        reply_markup: {
            keyboard: [
                ["📝 DAFTAR SEKARANG"],
                ["ℹ️ INFO BISNIS", "📞 HUBUNGI CS"]
            ],
            resize_keyboard: true
        }
    };

    bot.sendMessage(chatId, welcomeMessage, {
        ...keyboard
    });
}

// ✅ TAMPILKAN UNTUK USER SUDAH TERDAFTAR
function showMainMenuRegistered(bot, chatId, agent) {
    const balance = agent.balance || 0;
    const name = agent.name || agent.username || 'Agent';
    
    const welcomeMessage = `🤖 BOT PULSA PPOB

Halo ${name}! 
Selamat datang kembali di sistem PPOB.

💼 Status: Agent Aktif
💰 Saldo: Rp ${balance.toLocaleString('id-ID')}
📱 Telepon: ${agent.phone}

Silakan pilih menu di bawah:`;

    const keyboard = {
        reply_markup: {
            keyboard: [
                ["📱 BELI PULSA/DATA", "💰 DEPOSIT"],
                ["👤 PROFILE AGENT", "🔐 GANTI PIN"],
                ["📊 LAPORAN", "🏠 MENU UTAMA"]
            ],
            resize_keyboard: true
        }
    };

    bot.sendMessage(chatId, welcomeMessage, {
        ...keyboard
    });
}

// ✅ INFO BISNIS
function showBusinessInfo(bot, chatId) {
    const message = `💼 INFO BISNIS PPOB

📊 Sistem Kerja:
1. Anda deposit saldo ke sistem
2. Jual produk ke customer
3. Dapatkan komisi setiap transaksi
4. Tarik saldo kapan saja

💰 Contoh Penghasilan:
• Pulsa 5k → Komisi Rp 300
• Pulsa 10k → Komisi Rp 500  
• Pulsa 25k → Komisi Rp 1.000
• Pulsa 50k → Komisi Rp 2.000
• Pulsa 100k → Komisi Rp 4.000

🎯 Keuntungan:
• Modal bisa kecil (min. Rp 10.000)
• Bisa kerja dari mana saja
• Tidak perlu stok produk
• Support 24/7

Daftar sekarang untuk mulai berbisnis!`;

    const keyboard = {
        reply_markup: {
            keyboard: [
                ["📝 DAFTAR SEKARANG"],
                ["🏠 MENU UTAMA"]
            ],
            resize_keyboard: true
        }
    };

    bot.sendMessage(chatId, message, {
        ...keyboard
    });
}

// ✅ HUBUNGI CS
function showContactCS(bot, chatId) {
    const message = `📞 HUBUNGI CUSTOMER SERVICE

Untuk pertanyaan tentang pendaftaran atau bisnis PPOB, hubungi:

👨‍💼 Admin: @admin_username
📱 WhatsApp: 08xx-xxxx-xxxx
⏰ Jam Operasional: 24/7

🔧 Bantuan Teknis:
• Pendaftaran akun
• Deposit saldo
• Problem transaksi
• Laporan bug

Silakan chat admin untuk bantuan lebih lanjut`;

    const keyboard = {
        reply_markup: {
            keyboard: [
                ["📝 DAFTAR SEKARANG"],
                ["🏠 MENU UTAMA"]
            ],
            resize_keyboard: true
        }
    };

    bot.sendMessage(chatId, message, {
        ...keyboard
    });
}