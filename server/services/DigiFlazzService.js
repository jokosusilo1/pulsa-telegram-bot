// services/DigiFlazzService.js
const axios = require('axios');
const crypto = require('crypto');

class DigiFlazzService {
  constructor() {
    this.username = process.env.DIGIFLAZZ_USERNAME;
    this.apiKey = process.env.DIGIFLAZZ_API_KEY;
    this.baseURL = 'https://api.digiflazz.com/v1';
  }

  generateSignature(cmd) {
    return crypto.createHash('md5')
      .update(this.username + this.apiKey + cmd)
      .digest('hex');
  }

  async getPriceList() {
    try {
      const response = await axios.post(`${this.baseURL}/price-list`, {
        cmd: 'prepaid',
        username: this.username,
        sign: this.generateSignature('pricelist')
      });

      return response.data.data;
    } catch (error) {
      console.error('Error getting DigiFlazz products:', error.response?.data || error.message);
      throw error;
    }
  }

  async checkBalance() {
    try {
      const response = await axios.post(`${this.baseURL}/cek-saldo`, {
        username: this.username,
        sign: this.generateSignature('depo')
      });

      return response.data.data;
    } catch (error) {
      console.error('Error checking balance:', error.response?.data || error.message);
      throw error;
    }
  }

  async purchase(sku, customerNo, refId) {
    try {
      const response = await axios.post(`${this.baseURL}/transaction`, {
        username: this.username,
        buyer_sku_code: sku,
        customer_no: customerNo,
        ref_id: refId,
        sign: this.generateSignature('depo')
      });

      return response.data.data;
    } catch (error) {
      console.error('Error purchasing:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = DigiFlazzService;