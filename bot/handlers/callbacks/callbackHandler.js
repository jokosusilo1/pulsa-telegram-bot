const UserSession = require('../../services/userSession');
const PurchaseHandler = require('../commands/purchase');

class CallbackHandler {
    static register(bot) {
        bot.on('callback_query', async (callbackQuery) => {
            const message = callbackQuery.message;
            const chatId = message.chat.id;
            const data = callbackQuery.data;

            await bot.answerCallbackQuery(callbackQuery.id);

            try {
                if (data === 'cancel_purchase' || data === 'cancel') {
                    PurchaseHandler.cancelPurchase(bot, chatId);
                    return;
                }

                if (data.startsWith('operator_')) {
                    await this.handleOperatorSelection(bot, message, data);
                }

                if (data.startsWith('nominal_')) {
                    await this.handleNominalSelection(bot, message, data);
                }

            } catch (error) {
                console.error('Callback error:', error);
                bot.sendMessage(chatId, '❌ Terjadi error, silakan coba lagi.');
            }
        });
    }

    static async handleOperatorSelection(bot, message, data) {
        const chatId = message.chat.id;
        const operator = data.replace('operator_', '');
        const user = UserSession.getUserData(chatId);

        if (user) {
            UserSession.setUserData(chatId, { ...user, operator });
            UserSession.setUserState(chatId, 'waiting_amount');

            await bot.editMessageText(
                `📱 **NOMOR:** ${user.phone}\n📞 **OPERATOR:** ${operator.toUpperCase()}\n\nPilih nominal:`,
                {
                    chat_id: chatId,
                    message_id: message.message_id,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '💰 5.000', callback_data: `nominal_${operator}_5k` },
                                { text: '💰 10.000', callback_data: `nominal_${operator}_10k` }
                            ],
                            [
                                { text: '💰 25.000', callback_data: `nominal_${operator}_25k` },
                                { text: '💰 50.000', callback_data: `nominal_${operator}_50k` }
                            ],
                            [
                                { text: '💰 100.000', callback_data: `nominal_${operator}_100k` }
                            ],
                            [
                                { text: '🚫 Batalkan', callback_data: 'cancel_purchase' }
                            ]
                        ]
                    }
                }
            );
        }
    }

    static async handleNominalSelection(bot, message, data) {
        const chatId = message.chat.id;
        // Handle nominal selection logic here
        await bot.sendMessage(chatId, `✅ Fitur pembelian dalam pengembangan...`);
    }
}

module.exports = CallbackHandler;
