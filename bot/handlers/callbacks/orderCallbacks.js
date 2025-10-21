const BotProductService = require('../../services/BotProductService');
const StorageService = require('../../../server/services/StorageService');
const DigiFlazzService = require('../../../server/services/DigiFlazzService');

class OrderCallbacks {
    static register(bot) {
        bot.on('callback_query', async (callbackQuery) => {
            const msg = callbackQuery.message;
            const chatId = msg.chat.id;
            const data = callbackQuery.data;

            try {
                // Handle order confirmation
                if (data.startsWith('confirm_order_')) {
                    await this.handleOrderConfirmation(bot, callbackQuery, msg, data);
                }
                // Handle order cancellation
                else if (data === 'cancel_order') {
                    await this.handleOrderCancellation(bot, callbackQuery, msg);
                }
                // Handle balance refresh
                else if (data === 'refresh_balance') {
                    await this.handleBalanceRefresh(bot, callbackQuery, msg);
                }
                // Handle view history
                else if (data === 'view_history') {
                    await this.handleViewHistory(bot, callbackQuery, msg);
                }

            } catch (error) {
                console.error('Error in callback handler:', error);
                bot.answerCallbackQuery(callbackQuery.id, { text: "❌ Terjadi kesalahan" });
            }
        });
    }

    static async handleOrderConfirmation(bot, callbackQuery, msg, data) {
        const chatId = msg.chat.id;
        const parts = data.split('_');
        const productCode = parts[2];
        const customerNumber = parts[3];

        // Tampilkan pesan processing
        await bot.editMessageText('🔄 Memproses pesanan...', {
            chat_id: chatId,
            message_id: msg.message_id
        });

        try {
            // Cari produk lagi untuk memastikan data terbaru
            const product = await BotProductService.findProductForBot(productCode);
            
            if (!product) {
                throw new Error('Produk tidak ditemukan');
            }

            // Cek atau buat agent
            let agent = await StorageService.getAgent(chatId.toString());
            if (!agent) {
                // Buat agent baru jika belum ada
                await StorageService.createAgent({
                    name: callbackQuery.from.first_name || 'User',
                    phone: callbackQuery.from.id.toString()
                });
                agent = await StorageService.getAgent(chatId.toString());
            }

            // Cek saldo agent
            if (agent.balance < product.price) {
                throw new Error(`Saldo tidak cukup. Dibutuhkan: Rp ${product.price.toLocaleString('id-ID')}, Saldo: Rp ${agent.balance.toLocaleString('id-ID')}`);
            }

            // Generate reference ID
            const refId = `REF${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

            // Process order ke DigiFlazz
            const digiflazz = new DigiFlazzService();
            const purchaseResult = await digiflazz.purchase(productCode, customerNumber, refId);

            if (!purchaseResult || purchaseResult.status !== 'success') {
                throw new Error(`Gagal memproses di DigiFlazz: ${purchaseResult?.message || 'Unknown error'}`);
            }

            // Kurangi saldo agent
            await StorageService.updateAgentBalance(chatId.toString(), -product.price);

            // Catat transaksi
            const transaction = await StorageService.saveTransaction({
                agentId: chatId.toString(),
                customerPhone: customerNumber,
                productCode: product.code,
                productName: product.name,
                amount: product.price,
                commission: product.commission,
                refId: refId,
                digiflazzResponse: purchaseResult,
                status: 'success'
            });

            const successMessage = `
🎉 **PEMESANAN BERHASIL!**

📦 Produk: ${product.name}
💰 Harga: Rp ${product.price.toLocaleString('id-ID')}
💸 Komisi: Rp ${product.commission.toLocaleString('id-ID')}
📞 Nomor: ${customerNumber}
📄 Ref ID: ${refId}
⏰ Waktu: ${new Date().toLocaleString('id-ID')}

✅ Saldo terpotong: Rp ${product.price.toLocaleString('id-ID')}
💰 Saldo sekarang: Rp ${(agent.balance - product.price).toLocaleString('id-ID')}

Terima kasih telah berbelanja!
            `;

            bot.editMessageText(successMessage, {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: 'Markdown'
            });

        } catch (error) {
            console.error('Error processing order:', error);
            bot.editMessageText(`❌ Gagal memproses pesanan: ${error.message}`, {
                chat_id: chatId,
                message_id: msg.message_id
            });
        }

        bot.answerCallbackQuery(callbackQuery.id);
    }

    static async handleOrderCancellation(bot, callbackQuery, msg) {
        const chatId = msg.chat.id;
        
        bot.editMessageText('❌ Pemesanan dibatalkan.', {
            chat_id: chatId,
            message_id: msg.message_id
        });
        
        bot.answerCallbackQuery(callbackQuery.id);
    }

    static async handleBalanceRefresh(bot, callbackQuery, msg) {
        const chatId = msg.chat.id;
        
        try {
            const agentId = chatId.toString();
            const agent = await StorageService.getAgent(agentId);
            const stats = await StorageService.getAgentStats(agentId);

            const balanceMessage = `
💰 **INFO SALDO - DIPERBARUI**

👤 Agent: ${agent.name || 'N/A'}
📞 Phone: ${agent.phone || 'N/A'}

💳 **Saldo:** Rp ${agent.balance.toLocaleString('id-ID')}

📊 **Statistik Hari Ini:**
🛒 Transaksi: ${stats.todayTransactions}
📈 Penjualan: Rp ${stats.todaySales.toLocaleString('id-ID')}
💸 Komisi: Rp ${stats.todayCommission.toLocaleString('id-ID')}

📈 **Statistik Total:**
🛒 Transaksi: ${stats.totalTransactions}
📈 Penjualan: Rp ${stats.totalSales.toLocaleString('id-ID')}
💸 Komisi: Rp ${stats.totalCommission.toLocaleString('id-ID')}
            `;

            bot.editMessageText(balanceMessage, {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🔄 Refresh", callback_data: "refresh_balance" }],
                        [{ text: "📋 Riwayat Transaksi", callback_data: "view_history" }]
                    ]
                }
            });

            bot.answerCallbackQuery(callbackQuery.id, { text: "✅ Saldo diperbarui!" });

        } catch (error) {
            console.error('Error refreshing balance:', error);
            bot.answerCallbackQuery(callbackQuery.id, { text: "❌ Gagal refresh saldo" });
        }
    }

    static async handleViewHistory(bot, callbackQuery, msg) {
        const chatId = msg.chat.id;
        const agentId = chatId.toString();
        
        try {
            const transactions = await StorageService.getAgentTransactions(agentId, 10);
            
            if (transactions.length === 0) {
                return bot.answerCallbackQuery(callbackQuery.id, { text: "📭 Tidak ada riwayat transaksi" });
            }

            let historyMessage = '📋 **RIWAYAT TRANSAKSI TERAKHIR**\n\n';
            
            transactions.forEach((tx, index) => {
                const date = new Date(tx.timestamp).toLocaleDateString('id-ID');
                historyMessage += `${index + 1}. ${tx.productName}\n`;
                historyMessage += `   📱: ${tx.customerPhone}\n`;
                historyMessage += `   💰: Rp ${tx.amount.toLocaleString('id-ID')}\n`;
                historyMessage += `   📅: ${date}\n\n`;
            });

            bot.sendMessage(chatId, historyMessage, { parse_mode: 'Markdown' });
            bot.answerCallbackQuery(callbackQuery.id, { text: "✅ Riwayat dikirim" });

        } catch (error) {
            console.error('Error viewing history:', error);
            bot.answerCallbackQuery(callbackQuery.id, { text: "❌ Gagal mengambil riwayat" });
        }
    }
}

module.exports = OrderCallbacks;
