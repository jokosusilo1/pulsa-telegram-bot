const AgentService = require('../services/AgentService');

// Store untuk menyimpan message IDs
const userMessageStore = new Map();

// Simpan message ID untuk user
function saveUserMessage(chatId, messageId) {
    if (!userMessageStore.has(chatId)) {
        userMessageStore.set(chatId, []);
    }
    userMessageStore.get(chatId).push(messageId);
}

// Hapus pesan sebelumnya untuk user
async function deletePreviousMessages(bot, chatId) {
    try {
        if (userMessageStore.has(chatId)) {
            const messageIds = userMessageStore.get(chatId);
            
            for (const messageId of messageIds) {
                try {
                    await bot.deleteMessage(chatId, messageId);
                    console.log(`🗑️ Deleted message ${messageId} for chat ${chatId}`);
                } catch (deleteError) {
                    // Pesan mungkin sudah dihapus atau tidak ada
                    if (deleteError.response && deleteError.response.status_code !== 400) {
                        console.log(`⚠️ Cannot delete message ${messageId}: ${deleteError.message}`);
                    }
                }
            }
            
            // Kosongkan store untuk chat ini
            userMessageStore.set(chatId, []);
        }
    } catch (error) {
        console.error('❌ Error deleting previous messages:', error);
    }
}

// Tampilkan menu utama dengan auto delete previous messages
async function showMainMenu(bot, chatId, userData) {
    try {
        // Hapus pesan-pesan sebelumnya
        await deletePreviousMessages(bot, chatId);

        // Dapatkan data agent terbaru dari database
        const agent = await AgentService.getAgent(userData.id.toString());
        const userName = agent ? agent.name : userData.first_name;
        const userBalance = agent ? agent.balance : 0;

        const menuMessage = `🏠 <b>MENU UTAMA AGENT PULSA</b>\n\n` +
                          `Halo <b>${userName}</b>! \n` +
                          `💰 <b>Saldo:</b> Rp ${userBalance.toLocaleString('id-ID')}\n\n` +
                          `💡 <b>Silakan pilih menu yang Anda butuhkan:</b>`;

        const mainMenuKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📱 BELI PULSA/DATA', callback_data: 'category_pulsa' },
                        { text: '⚡ TOKEN PLN', callback_data: 'category_pln' }
                    ],
                    [
                        { text: '🎮 VOUCHER GAME', callback_data: 'category_voucher' },
                        { text: '📺 VOUCHER TV', callback_data: 'category_tv' }
                    ],
                    [
                        { text: '💳 DEPOSIT SALDO', callback_data: 'show_deposit' },
                        { text: '💰 CEK SALDO', callback_data: 'check_balance' }
                    ],
                    [
                        { text: '📋 RIWAYAT TRANSAKSI', callback_data: 'show_history' },
                        { text: '👤 PROFIL AGENT', callback_data: 'show_profile' }
                    ],
                    [
                        { text: '📞 KONTAK ADMIN', callback_data: 'show_contact' },
                        { text: '❓ BANTUAN', callback_data: 'show_help' }
                    ]
                ]
            },
            parse_mode: 'HTML'
        };

        const sentMessage = await bot.sendMessage(chatId, menuMessage, mainMenuKeyboard);
        
        // Simpan message ID untuk dihapus nanti
        saveUserMessage(chatId, sentMessage.message_id);
        
        console.log(`✅ Main menu shown for: ${userName}`);

    } catch (error) {
        console.error('❌ Error showing main menu:', error);
        const errorMessage = await bot.sendMessage(chatId, 
            '❌ Terjadi error saat menampilkan menu utama.\n\n' +
            'Silakan ketik /start untuk mencoba lagi.'
        );
        saveUserMessage(chatId, errorMessage.message_id);
    }
}

// Fungsi untuk cek status registrasi
async function checkRegistrationStatus(bot, chatId, user) {
    try {
        const userId = user.id.toString();
        console.log(`🔍 Checking registration status for: ${userId}`);
        
        // Cek apakah user sudah terdaftar
        const isRegistered = await AgentService.checkAgentRegistration(userId);
        console.log(`📊 Registration status for ${userId}: ${isRegistered}`);
        
        if (isRegistered) {
            // User sudah terdaftar - tampilkan menu utama
            await showMainMenu(bot, chatId, user);
            return true;
        } else {
            // Hapus pesan-pesan sebelumnya
            await deletePreviousMessages(bot, chatId);
            
            // User belum terdaftar - tampilkan pesan pendaftaran
            const welcomeMessage = `👋 Halo <b>${user.first_name}</b>! Selamat datang di Bot Pulsa Agent.\n\n` +
                                 `📝 <b>Anda perlu registrasi terlebih dahulu untuk menggunakan layanan.</b>\n\n` +
                                 `✨ <b>Fitur yang tersedia setelah registrasi:</b>\n` +
                                 `• Beli pulsa semua operator\n` +
                                 `• Paket internet & data\n` +
                                 `• Token PLN\n` +
                                 `• Voucher game & TV\n` +
                                 `• Deposit saldo\n\n` +
                                 `📋 <b>Cara Registrasi:</b>\n` +
                                 `Ketik: <code>/register [Nama Lengkap] [Nomor HP]</code>\n\n` +
                                 `📌 <b>Contoh:</b>\n` +
                                 `<code>/register ${user.first_name} 081234567890</code>\n\n` +
                                 `🚀 <b>Segera daftar dan nikmati kemudahan transaksi!</b>`;

            const sentMessage = await bot.sendMessage(chatId, welcomeMessage, {
                parse_mode: 'HTML'
            });
            
            // Simpan message ID untuk dihapus nanti
            saveUserMessage(chatId, sentMessage.message_id);
            
            return false;
        }
    } catch (error) {
        console.error('❌ Error checking registration status:', error);
        
        // Hapus pesan-pesan sebelumnya
        await deletePreviousMessages(bot, chatId);
        
        // Fallback: tampilkan pesan error
        const errorMessage = `❌ <b>Terjadi kesalahan saat memeriksa status registrasi</b>\n\n` +
                           `Silakan coba registrasi manual dengan perintah:\n\n` +
                           `<code>/register [Nama Lengkap] [Nomor HP]</code>\n\n` +
                           `📌 <b>Contoh:</b>\n` +
                           `<code>/register ${user.first_name} 081234567890</code>`;

        const sentMessage = await bot.sendMessage(chatId, errorMessage, {
            parse_mode: 'HTML'
        });
        
        saveUserMessage(chatId, sentMessage.message_id);
        
        return false;
    }
}

// Command start utama
const startCommand = (bot) => {
    console.log('🔄 Loading start command with auto-delete...');

    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const user = msg.from;
        
        console.log('🎯 /start from:', user.first_name, `(${user.id})`);
        
        // Cek status registrasi dan arahkan
        await checkRegistrationStatus(bot, chatId, user);
    });

    // Handle menu utama dari text message
    bot.on('message', async (msg) => {
        if (msg.text && (msg.text.includes('🏠 MENU UTAMA') || msg.text.includes('/menu'))) {
            const chatId = msg.chat.id;
            const user = msg.from;
            
            // Cek status registrasi dan arahkan
            await checkRegistrationStatus(bot, chatId, user);
        }
    });

    // Cleanup store periodically (setiap 1 jam)
    setInterval(() => {
        const now = Date.now();
        // Kita bisa tambahkan timestamp jika perlu, untuk sekarang cukup clear semua
        console.log('🧹 Cleaning up message store...');
    }, 60 * 60 * 1000);
};

// Export functions
module.exports = startCommand;
module.exports.showMainMenu = showMainMenu;
module.exports.checkRegistrationStatus = checkRegistrationStatus;