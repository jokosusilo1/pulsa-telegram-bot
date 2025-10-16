const axios = require('axios');
const { API_BASE_URL } = require('../config/constants');

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getProducts() {
    try {
      const response = await this.client.get('/api/products');
      return response.data;
    } catch (error) {
      console.error('API Error - getProducts:', error.message);
      return { success: false, data: [], message: 'Failed to fetch products' };
    }
  }

  async getProductBySKU(sku) {
    try {
      const response = await this.client.get(`/api/products/sku/${sku}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getProductBySKU:', error.message);
      return { success: false, message: 'Product not found' };
    }
  }

  async createOrder(orderData) {
    try {
      const response = await this.client.post('/api/transactions', orderData);
      return response.data;
    } catch (error) {
      console.error('API Error - createOrder:', error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Order failed' 
      };
    }
  }

  async checkOrderStatus(orderId) {
    try {
      const response = await this.client.get(`/api/transactions/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('API Error - checkOrderStatus:', error.message);
      return { success: false, message: 'Failed to check status' };
    }
  }

  async getBalance() {
    try {
      const response = await this.client.get('/api/balance');
      return response.data;
    } catch (error) {
      console.error('API Error - getBalance:', error.message);
      return { success: false, message: 'Failed to get balance' };
    }
  }
}

module.exports = new ApiService();
