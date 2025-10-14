// utils/helpers.js
class Helpers {
  static escapeMarkdown(text) {
    if (typeof text !== 'string') return String(text);
    return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
  }

  static formatPrice(price) {
    return `Rp ${parseInt(price).toLocaleString()}`;
  }

  static validatePhone(phone) {
    return /^08[0-9]{9,12}$/.test(phone);
  }

  static generateId(prefix = '') {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
  }

  static truncateMessage(text, maxLength = 4000) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 100) + '\n\n... (pesan terlalu panjang)';
  }
}

module.exports = Helpers;
