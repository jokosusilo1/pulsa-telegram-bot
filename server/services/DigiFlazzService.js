

const axios = require('axios');
const crypto = require('crypto');

class DigiFlazzService {
  constructor() {
    this.username = process.env.DIGIFLAZZ_USERNAME;
    this.apiKey = process.env.DIGIFLAZZ_API_KEY;
    this.baseURL = 'https://api.digiflazz.com/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  generateSignature(cmd) {
    return crypto.createHash('md5')
      .update(this.username + this.apiKey + cmd)
      .digest('hex');
  }

  async getPriceList() {
    try {
      const response = await this.client.post('/price-list', {
        cmd: 'prepaid',
        username: this.username,
        sign: this.generateSignature('pricelist')
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching DigiFlazz price list:', error.response?.data || error.message);
      throw new Error('Gagal mengambil data produk dari DigiFlazz');
    }
  }

  async purchase(sku, customerNo, refId) {
    try {
      const response = await this.client.post('/transaction', {
        username: this.username,
        buyer_sku_code: sku,
        customer_no: customerNo,
        ref_id: refId,
        sign: this.generateSignature('deposit')
      });

      const result = response.data;
      
      if (result.data && result.data.status === 'Gagal') {
        throw new Error(result.data.message || 'Transaksi gagal di DigiFlazz');
      }

      return result.data;
    } catch (error) {
      console.error('DigiFlazz purchase error:', error.response?.data || error.message);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Terjadi kesalahan saat memproses transaksi di DigiFlazz');
    }
  }

  async checkBalance() {
    try {
      const response = await this.client.post('/cek-saldo', {
        username: this.username,
        sign: this.generateSignature('deposit')
      });

      return response.data.data;
    } catch (error) {
      console.error('Error checking DigiFlazz balance:', error);
      throw new Error('Gagal memeriksa saldo DigiFlazz');
    }
  }
}

module.exports = DigiFlazzService;