// config/constants.js
module.exports = {
  // Product categories
  CATEGORIES: {
    PULSA: 'pulsa',
    DATA: 'data', 
    GAMES: 'games',
    E_WALLET: 'ewallet',
    PLN: 'pln'
  },

  // User states
  STATES: {
    MAIN_MENU: 'main_menu',
    WAITING_PHONE: 'waiting_phone',
    WAITING_OPERATOR: 'waiting_operator',
    WAITING_AMOUNT: 'waiting_amount',
    WAITING_CONFIRMATION: 'waiting_confirmation',
    REGISTRATION_PHONE: 'registration_phone',
    DEPOSIT_AMOUNT: 'deposit_amount',
    DEPOSIT_METHOD: 'deposit_method'
  },

  // Keyboard layouts
  KEYBOARDS: {
    MAIN: [
      ['📋 PENDAFTARAN', '💰 DEPOSIT'],
      ['🛒 BELI PULSA', '📦 PAKET DATA', '🎮 GAMES'],
      ['💳 E-WALLET', '💡 PLN', '📊 CEK HARGA'],
      ['💼 CEK SALDO', '👤 PROFIL', '❓ BANTUAN']
    ],
    CANCEL: [['🚫 BATAL']]
  },

  // Messages
  MESSAGES: {
    WELCOME: `🤖 **SELAMAT DATANG DI TOKO PULSA DIGIFLAZZ**\n\nHalo! Saya siap melayani pembelian:\n• 📱 Pulsa & Paket Data\n• 🎮 Voucher Game\n• 💳 E-Wallet\n• 💡 Token PLN\n\nPilih menu di bawah:`,
    HELP: `❓ **BANTUAN & PANDUAN**\n\n*CARA PENGGUNAAN:*\n1. Pilih "Beli Pulsa"\n2. Masukkan nomor HP\n3. Pilih operator & nominal\n4. Konfirmasi pembelian\n\n*FITUR LAIN:*\n• 💰 Deposit: Top up saldo member\n• 📊 Cek Harga: Lihat harga terbaru\n• 👤 Profil: Lihat data Anda\n\n*SUPPORT:*\nHubungi admin untuk bantuan lebih lanjut.`
  }
};
