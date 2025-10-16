const axios = require('axios');
const { API_BASE_URL } = require('../config/constants');

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getProducts() {
    try {
      const response = await axios.get(`${this.baseURL}/api/products`);
      return response.data;
    } catch (error) {
      console.error('API Error - getProducts:', error.message);
      return { success: false, data: [] };
    }
  }

  async getCategories() {
    try {
      const response = await axios.get(`${this.baseURL}/api/categories`);
      return response.data;
    } catch (error) {
      console.error('API Error - getCategories:', error.message);
      return { success: false, data: [] };
    }
  }

  async createTransaction(transactionData) {
    try {
      const response = await axios.post(`${this.baseURL}/api/transactions`, transactionData);
      return response.data;
    } catch (error) {
      console.error('API Error - createTransaction:', error.message);
      return { success: false, message: 'Transaction failed' };
    }
  }
}

module.exports = new ApiService();
