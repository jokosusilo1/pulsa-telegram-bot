const mainMenuKeyboard = {
    reply_markup: {
        keyboard: [
            ["📱 BELI PULSA/DATA", "💰 DEPOSIT SALDO"],
            ["👤 PROFILE AGENT", "📞 BANTUAN"],
            ["🏠 MENU UTAMA"]
        ],
        resize_keyboard: true
    }
};

const welcomeKeyboard = {
    reply_markup: {
        keyboard: [
            ["📱 BELI PULSA/DATA", "💰 CEK HARGA"],
            ["📝 DAFTAR AGENT", "📞 BANTUAN"]
        ],
        resize_keyboard: true
    }
};

const registrationKeyboard = {
    reply_markup: {
        keyboard: [
            ["📝 DAFTAR SEKARANG"],
            ["ℹ️ INFO BISNIS", "📞 HUBUNGI CS"]
        ],
        resize_keyboard: true
    }
};

module.exports = {
    mainMenuKeyboard,
    welcomeKeyboard,
    registrationKeyboard
};
