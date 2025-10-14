// handlers/messageHandlers.js
const Helpers = require('../utils/helpers');
const Constants = require('../config/constants');

class MessageHandlers {
  constructor(bot, userStates, userData) {
    this.bot = bot;
    this.userStates = userStates;
    this.userData = userData;
  }

  handleTextMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const state = this.userStates.get(chatId);

    // Skip commands
    if (text.startsWith('/')) return;

    // Handle based on state
    switch (state) {
      case Constants.STATES.REGISTRATION_PHONE:
        this.handleRegistrationPhone(chatId, text);
        break;
      case Constants.STATES.WAITING_PHONE:
        this.handlePurchasePhone(chatId, text);
        break;
      case Constants.STATES.DEPOSIT_AMOUNT:
        this.handleDepositAmount(chatId, text);
        break;
      default:
        // Do nothing for unhandled states
        break;
    }
  }

  handleRegistrationPhone(chatId, phone) {
    if (phone === '🚫 BATAL') {
      this.cancelOperation(chatId);
      return;
    }

    if (Helpers.validatePhone(phone)) {
      // Process registration
      this.userStates.set(chatId, Constants.STATES.MAIN_MENU);
      this.bot.sendMessage(chatId, `✅ *PENDAFTARAN BERHASIL!*\n\nNomor terdaftar: ${phone}`, {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: Constants.KEYBOARDS.MAIN,
          resize_keyboard: true
        }
      });
    } else {
      this.bot.sendMessage(chatId, '❌ Format nomor tidak valid! Contoh: 081234567890');
    }
  }

  handlePurchasePhone(chatId, phone) {
    if (phone === '🚫 BATAL') {
      this.cancelOperation(chatId);
      return;
    }

    if (Helpers.validatePhone(phone)) {
      this.userData.set(chatId, { phone });
      this.userStates.set(chatId, Constants.STATES.WAITING_OPERATOR);
      
      this.bot.sendMessage(chatId, `📱 **NOMOR:** ${phone}\n\nPilih operator:`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📱 TELKOMSEL', callback_data: 'operator_telkomsel' },
              { text: '📱 XL', callback_data: 'operator_xl' }
            ],
            [
              { text: '📱 INDOSAT', callback_data: 'operator_indosat' },
              { text: '📱 AXIS', callback_data: 'operator_axis' }
            ],
            [
              { text: '🚫 Batalkan', callback_data: 'cancel' }
            ]
          ]
        }
      });
    } else {
      this.bot.sendMessage(chatId, '❌ Format nomor tidak valid! Contoh: 081234567890');
    }
  }

  handleDepositAmount(chatId, amountText) {
    if (amountText === '🚫 BATAL') {
      this.cancelOperation(chatId);
      return;
    }

    const amount = parseInt(amountText.replace(/[^0-9]/g, ''));
    if (isNaN(amount) || amount < 10000) {
      this.bot.sendMessage(chatId, '❌ Nominal tidak valid! Minimal deposit Rp 10.000');
      return;
    }

    // Process deposit
    this.userData.set(chatId, { depositAmount: amount });
    this.userStates.set(chatId, Constants.STATES.DEPOSIT_METHOD);
    
    this.bot.sendMessage(chatId, `💰 *DEPOSIT SALDO*\n\nNominal: ${Helpers.formatPrice(amount)}\n\nPilih metode pembayaran:`, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          ['💳 QRIS (Instant)', '🏦 Transfer Bank'],
          ['🚫 BATALKAN']
        ],
        resize_keyboard: true
      }
    });
  }

  cancelOperation(chatId) {
    this.userStates.set(chatId, Constants.STATES.MAIN_MENU);
    this.userData.delete(chatId);
    
    this.bot.sendMessage(chatId, '❌ Operasi dibatalkan.', {
      reply_markup: {
        keyboard: Constants.KEYBOARDS.MAIN,
        resize_keyboard: true
      }
    });
  }
}

module.exports = MessageHandlers;
