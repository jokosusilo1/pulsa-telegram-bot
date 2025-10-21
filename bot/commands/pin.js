const agentStorage = new Map();

module.exports = (bot) => {
    console.log("🔄 Loading PIN management commands...");

    // Command untuk ganti PIN
    bot.onText(/\/gantipin/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        try {
            const agent = agentStorage.get(userId);
            if (!agent) {
                return bot.sendMessage(chatId, '❌ Anda belum terdaftar sebagai agent.');
            }

            // Start PIN change process
            const pinState = {
                step: 'current_pin',
                agentId: userId
            };
            // Simpan state di storage terpisah atau extend registrationState

            bot.sendMessage(chatId, 
                '🔐 **GANTI PIN**\n\n' +
                'Masukkan PIN lama Anda:'
            );

        } catch (error) {
            console.error('Error in /gantipin:', error);
            bot.sendMessage(chatId, '❌ Gagal memproses perubahan PIN.');
        }
    });

    // Handler untuk tombol GANTI PIN
    bot.on('message', async (msg) => {
        if (!msg.text) return;
        
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text === '🔐 GANTI PIN') {
            bot.sendMessage(chatId, 
                '🔐 **GANTI PIN**\n\n' +
                'Untuk keamanan, gunakan command:\n' +
                '`/gantipin`\n\n' +
                'Anda akan diminta memasukkan PIN lama dan PIN baru.'
            );
        }
    });

    console.log("✅ PIN management commands loaded");
};
