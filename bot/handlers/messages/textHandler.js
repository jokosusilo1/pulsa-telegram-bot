const UserSession = require('../../services/userSession');
const PurchaseHandler = require('../commands/purchase');

class TextHandler {
    static register(bot) {
        bot.on('message', (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;

            // Skip commands
            if (text.startsWith('/')) return;

            const state = UserSession.getUserState(chatId);
            
            switch (state) {
                case 'waiting_phone_pulsa':
                    PurchaseHandler.handlePhoneInput(bot, msg);
                    break;
                case 'waiting_deposit_amount':
                    require('../commands/deposit').handleDepositAmount(bot, msg);
                    break;
                default:
                    // Handle other text messages
                    break;
            }
        });
    }
}

module.exports = TextHandler;
