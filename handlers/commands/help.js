
const handleHelp = (bot) => (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `📋 **Daftar Perintah Bot**:

💳 **Transaksi**:
/topup - Top up saldo
/pay - Bayar tagihan

📊 **Informasi**:
/limit - Lihat limit harian
/riwayat - Riwayat transaksi

⚙️ **Pengaturan**:
/buatlimit - Set limit harian
/batal - Batalkan transaksi

🔍 **Lainnya**:
/start - Mulai bot
/help - Bantuan ini`;

  bot.sendMessage(chatId, helpMessage);
};

module.exports = handleHelp;
