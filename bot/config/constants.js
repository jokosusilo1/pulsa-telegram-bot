// Load environment variables
require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  API_BASE_URL: process.env.API_BASE_URL || 'https://pulsa-api.onrender.com',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Digiflazz Config
  DIGIFLAZZ_USERNAME: process.env.DIGIFLAZZ_USERNAME,
  DIGIFLAZZ_API_KEY: process.env.DIGIFLAZZ_API_KEY,
  
  // Bot Messages
  MESSAGES: {
    WELCOME: "🤖 *Bot Pulsa Telegram*\\n\\nSelamat datang! Saya siap membantu Anda.",
    HELP: "📖 *Perintah yang tersedia:*\\n\\n/start - Memulai bot\\n/products - Lihat produk\\n/balance - Cek saldo\\n/help - Bantuan"
  }
};
