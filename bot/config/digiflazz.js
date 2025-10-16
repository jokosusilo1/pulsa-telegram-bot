const axios = require('axios');
const { DIGIFLAZZ_USERNAME, DIGIFLAZZ_API_KEY } = require('./constants');

class Digiflazz {
  constructor() {
    this.username = DIGIFLAZZ_USERNAME;
    this.apiKey = DIGIFLAZZ_API_KEY;
    this.baseURL = 'https://api.digiflazz.com/v1';
  }

  async checkBalance() {
    try {
      const response = await axios.post(`${this.baseURL}/cek-saldo`, {
        cmd: "deposit",
        username: this.username,
        sign: this.generateSignature()
      });

      return {
        success: true,
        balance: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getPriceList() {
    try {
      const response = await axios.post(`${this.baseURL}/price-list`, {
        username: this.username,
        sign: this.generateSignature()
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async purchase(productCode, customerNo, refId = null) {
    try {
      const payload = {
        username: this.username,
        buyer_sku_code: productCode,
        customer_no: customerNo,
        sign: this.generateSignature()
      };

      if (refId) {
        payload.ref_id = refId;
      }

      const response = await axios.post(`${this.baseURL}/transaction`, payload);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateSignature() {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(this.username + this.apiKey + 'deposit').digest('hex');
  }
}

module.exports = new Digiflazz();
