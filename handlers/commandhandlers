// handlers/commandHandlers.js
const Helpers = require('../utils/helpers');
const Constants = require('../config/constants');

class CommandHandlers {
  constructor(bot, userStates) {
    this.bot = bot;
    this.userStates = userStates;
  }

  handleStart(msg) {
    const chatId = msg.chat.id;
    this.userStates.set(chatId, Constants.STATES.MAIN_MENU);
    
    this.bot.sendMessage(chatId, Constants.MESSAGES.WELCOME, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: Constants.KEYBOARDS.MAIN,
        resize_keyboard: true
      }
    });
  }

  handleHelp(msg) {
    const chatId = msg.chat.id;
    this.bot.sendMessage(chatId, Constants.MESSAGES.HELP, {
      parse_mode: 'Markdown'
    });
  }

  handleProfile(msg) {
    const chatId = msg.chat.id;
    const user = msg.from;
    
    const profileMsg = `👤 **PROFIL PENGGUNA**\n\n` +
                      `🆔 ID: ${user.id}\n` +
                      `📛 Nama: ${Helpers.escapeMarkdown(user.first_name)} ${Helpers.escapeMarkdown(user.last_name || '')}\n` +
                      `🤖 Username: @${user.username || 'Tidak ada'}\n` +
                      `📅 Bergabung: ${new Date().toLocaleDateString('id-ID')}`;
    
    this.bot.sendMessage(chatId, profileMsg, {
      parse_mode: 'Markdown'
    });
  }

  handleCheckPrice(msg) {
    // Implementation for price check
    const chatId = msg.chat.id;
    this.bot.sendMessage(chatId, '📊 **Fitur cek harga sedang dalam pengembangan**', {
      parse_mode: 'Markdown'
    });
  }
}

module.exports = CommandHandlers;
