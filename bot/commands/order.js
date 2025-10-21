const BotProductService = require('../services/BotProductService');
const StorageService = require('../../server/services/StorageService');
const DigiFlazzService = require('../../server/services/DigiFlazzService');

module.exports = (bot) => {
    bot.onText(/\/order (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const params = match[1].split(' ');

        if (params.length < 2) {
            return bot.sendMessage(chatId, 
                '❌ Format: /order [kode] [nomor]\n**Contoh:** `/order Ax10 08123456789`',
                { parse_mode: 'Markdown' }
            );
        }

        const productCode = params[0].toUpperCase();
        const customerNumber = params[1];

        // Validasi nomor
        if (!customerNumber.match(/^[0-9]+$/) || customerNumber.length < 10) {
            return bot.sendMessage(chatId, '❌ Nomor tidak valid. Minimal 10 digit angka.');
        }

        try {
            // 1. 🎯 BOT -> Cari produk di StorageService
            const product = await BotProductService.findProductForBot(productCode);
            if (!product) {
                return bot.sendMessage(chatId, 
                    `❌ Produk "${productCode}" tidak ditemukan.`
                );
            }

            // 2. 💰 Cek/Membuat agent
            let agent = await StorageService.getAgent(chatId.toString());
            if (!agent) {
                await StorageService.createAgent({
                    name: msg.from.first_name || 'Agent',
                    phone: msg.from.id.toString()
                });
                agent = await StorageService.getAgent(chatId.toString());
            }

            // 3. 🔍 Cek saldo agent
            if (agent.balance < product.price) {
                return bot.sendMessage(chatId,
                    `❌ Saldo tidak cukup!\nDibutuhkan: Rp ${product.price.toLocaleString('id-ID')}\nSaldo Anda: Rp ${agent.balance.toLocaleString('id-ID')}`
                );
            }

            // Konfirmasi order
            const orderMessage = `
📦 **KONFIRMASI ORDER**

📱 ${product.name}
💰 Rp ${product.price.toLocaleString('id-ID')}
💸 Komisi: Rp ${product.commission.toLocaleString('id-ID')}
📞 ${customerNumber}
⚡ ${product.operator}

✅ Klik "Pesan Sekarang" untuk memproses
            `;

            bot.sendMessage(chatId, orderMessage, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "✅ Pesan Sekarang", callback_data: `confirm_${productCode}_${customerNumber}` },
                            { text: "❌ Batal", callback_data: 'cancel' }
                        ]
                    ]
                }
            });

        } catch (error) {
            console.error('Error in /order:', error);
            bot.sendMessage(chatId, '❌ Gagal memproses order.');
        }
    });

    // 🎯 Handle callback order confirmation
    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;

        if (data.startsWith('confirm_')) {
            try {
                const parts = data.split('_');
                const productCode = parts[1];
                const customerNumber = parts[2];

                // Update pesan menjadi processing
                await bot.editMessageText('🔄 **MEMPROSES ORDER...**\n\nMengirim ke DigiFlazz...', {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: 'Markdown'
                });

                // 1. 🎯 BOT -> Validasi ulang
                const product = await BotProductService.findProductForBot(productCode);
                const agent = await StorageService.getAgent(chatId.toString());

                if (!product || !agent) {
                    throw new Error('Data tidak valid');
                }

                // 2. 🌐 API PULSA -> Process ke DigiFlazz
                const digiflazz = new DigiFlazzService();
                const refId = `REF${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
                
                console.log(`🔄 Processing to DigiFlazz: ${productCode} -> ${customerNumber}`);
                const digiflazzResult = await digiflazz.purchase(productCode, customerNumber, refId);

                // 3. ✅ DIGIFLAZZ -> Response
                if (!digiflazzResult || digiflazzResult.status !== 'success') {
                    throw new Error(`DigiFlazz: ${digiflazzResult?.message || 'Gagal memproses'}`);
                }

                // 4. 💰 Update saldo agent
                await StorageService.updateAgentBalance(chatId.toString(), -product.price);

                // 5. 📝 Catat transaksi
                const transaction = await StorageService.saveTransaction({
                    agentId: chatId.toString(),
                    customerPhone: customerNumber,
                    productCode: product.code,
                    productName: product.name,
                    amount: product.price,
                    commission: product.commission,
                    refId: refId,
                    digiflazzResponse: digiflazzResult,
                    status: 'success'
                });

                // 6. 🎯 KIRIM HASIL KE AGENT
                const successMessage = `
🎉 **ORDER BERHASIL!**

📦 ${product.name}
💰 Rp ${product.price.toLocaleString('id-ID')}
💸 Komisi: Rp ${product.commission.toLocaleString('id-ID')}
📞 ${customerNumber}
📄 Ref: ${refId}
⏰ ${new Date().toLocaleString('id-ID')}

✅ Saldo terpotong: Rp ${product.price.toLocaleString('id-ID')}
💰 Saldo sekarang: Rp ${(agent.balance - product.price).toLocaleString('id-ID')}

Terima kasih telah berbelanja!
                `;

                await bot.editMessageText(successMessage, {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: 'Markdown'
                });

                console.log(`✅ Order success: ${refId} for agent ${chatId}`);

            } catch (error) {
                console.error('Order processing error:', error);
                
                await bot.editMessageText(`❌ **GAGAL MEMPROSES**\n\n${error.message}`, {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: 'Markdown'
                });
            }

        } else if (data === 'cancel') {
            await bot.editMessageText('❌ **ORDER DIBATALKAN**', {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                parse_mode: 'Markdown'
            });
        }

        bot.answerCallbackQuery(callbackQuery.id);
    });
    
    console.log("✅ /order command loaded");
};
