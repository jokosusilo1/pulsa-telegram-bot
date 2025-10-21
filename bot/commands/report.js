const AgentStorage = require('./storage/AgentStorage');

// Simulasi data transaksi
const transactionHistory = new Map();

module.exports = (bot) => {
    console.log("🔄 Loading report system...");

    // Command /laporan
    bot.onText(/\/laporan/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        try {
            const agent = AgentStorage.getAgent(userId);
            if (!agent) {
                return bot.sendMessage(chatId, '❌ Anda belum terdaftar sebagai agent.');
            }

            await showReportMenu(bot, chatId, agent);
        } catch (error) {
            console.error('Error in /laporan:', error);
            bot.sendMessage(chatId, '❌ Gagal memuat laporan.');
        }
    });

    // Handler untuk tombol laporan
    bot.on('message', async (msg) => {
        if (!msg.text) return;
        
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const text = msg.text;

        const agent = AgentStorage.getAgent(userId);
        if (!agent) return;

        if (text === '📊 LAPORAN') {
            await showReportMenu(bot, chatId, agent);
        }
        else if (text === '💳 RIWAYAT TRANSAKSI') {
            await showTransactionHistory(bot, chatId, userId);
        }
        else if (text === '📈 STATISTIK') {
            await showStatistics(bot, chatId, userId);
        }
        else if (text === '📄 LAPORAN HARIAN') {
            await showDailyReport(bot, chatId, userId);
        }
    });

    console.log("✅ Report system loaded");
};

// ✅ MENU LAPORAN
async function showReportMenu(bot, chatId, agent) {
    const message = `📊 SISTEM LAPORAN

Halo ${agent.name}! 
Berikut adalah ringkasan aktivitas Anda:

💰 Saldo: Rp ${agent.balance.toLocaleString('id-ID')}
📦 Total Transaksi: 0x
📅 Bergabung: ${new Date(agent.createdAt).toLocaleDateString('id-ID')}

Silakan pilih jenis laporan:`;

    const keyboard = {
        reply_markup: {
            keyboard: [
                ["💳 RIWAYAT TRANSAKSI", "📈 STATISTIK"],
                ["📄 LAPORAN HARIAN", "🏠 MENU UTAMA"]
            ],
            resize_keyboard: true
        }
    };

    await bot.sendMessage(chatId, message, { 
        ...keyboard
    });
}

// ✅ RIWAYAT TRANSAKSI
async function showTransactionHistory(bot, chatId, userId) {
    const transactions = transactionHistory.get(userId) || [];
    
    if (transactions.length === 0) {
        return bot.sendMessage(chatId, 
            '📭 BELUM ADA TRANSAKSI\n\n' +
            'Anda belum melakukan transaksi apapun.\n' +
            'Mulai dengan membeli produk pulsa atau paket data.'
        );
    }

    let message = `💳 RIWAYAT TRANSAKSI\n\n`;

    transactions.slice(0, 10).forEach((transaction, index) => {
        message += `${index + 1}. ${transaction.type}\n`;
        message += `   💰 Rp ${transaction.amount.toLocaleString('id-ID')}\n`;
        message += `   📱 ${transaction.target}\n`;
        message += `   ⏰ ${transaction.date}\n\n`;
    });

    if (transactions.length > 10) {
        message += `... dan ${transactions.length - 10} transaksi lainnya`;
    }

    await bot.sendMessage(chatId, message);
}

// ✅ STATISTIK
async function showStatistics(bot, chatId, userId) {
    const transactions = transactionHistory.get(userId) || [];
    
    const totalTransactions = transactions.length;
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const successTransactions = transactions.filter(t => t.status === 'success').length;

    const message = `📈 STATISTIK PERFORMANCE

📦 Total Transaksi: ${totalTransactions}x
✅ Transaksi Sukses: ${successTransactions}x
💰 Total Pengeluaran: Rp ${totalSpent.toLocaleString('id-ID')}
📊 Success Rate: ${totalTransactions > 0 ? Math.round((successTransactions / totalTransactions) * 100) : 0}%

🎯 Rekomendasi:
• Tingkatkan frekuensi transaksi
• Coba produk baru
• Ajak teman untuk bergabung`;

    await bot.sendMessage(chatId, message);
}

// ✅ LAPORAN HARIAN
async function showDailyReport(bot, chatId, userId) {
    const message = `📄 LAPORAN HARIAN

📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}
💰 Saldo Awal: Rp 0
💰 Saldo Akhir: Rp 0
📦 Transaksi Hari Ini: 0x
💸 Total Pengeluaran: Rp 0

📈 Aktivitas Hari Ini:
• Belum ada transaksi

💡 Mulai transaksi untuk melihat laporan yang lebih detail`;

    await bot.sendMessage(chatId, message);
}