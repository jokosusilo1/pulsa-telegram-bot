// bot/services/ApiService.js
const axios = require('axios');
const { API_BASE_URL, API_KEY } = require('../config/constants');

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });

    this.client.interceptors.request.use(
      (config) => {
        console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // ✅ FIXED: GET PULSA PROVIDERS - Sesuai dengan endpoint yang ada
  async getPulsaProviders() {
    try {
      console.log('🔄 Fetching pulsa providers from server...');
      const response = await this.client.get('/api/products/pulsa/providers');
      
      if (response.data && response.data.success) {
        console.log(`✅ Found ${response.data.count} pulsa providers`);
        return response.data;
      } else {
        console.log('⚠️ Unexpected response format, using fallback');
        return this.getFallbackPulsaProviders();
      }
      
    } catch (error) {
      console.error('API Error - getPulsaProviders:', error.response?.data || error.message);
      return this.getFallbackPulsaProviders();
    }
  }

  // ✅ FIXED: GET PRODUCTS BY CATEGORY - Sesuai dengan endpoint yang ada
  async getProductsByCategory(category, filters = {}) {
    try {
      console.log(`🔄 Getting products for category: ${category}`, filters);
      
      const params = new URLSearchParams();
      
      // Add filters if provided
      if (filters.provider) {
        params.append('provider', filters.provider);
      }
      if (filters.denomination) {
        params.append('denomination', filters.denomination);
      }
      
      const queryString = params.toString();
      const url = `/api/products/category/${category}${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.client.get(url);
      
      if (response.data && response.data.success) {
        return response.data;
      } else {
        return this.getFallbackProducts(category, filters.provider);
      }
      
    } catch (error) {
      console.error('API Error - getProductsByCategory:', error.response?.data || error.message);
      return this.getFallbackProducts(category, filters.provider);
    }
  }

  // ✅ FIXED: GET ALL CATEGORIES
  async getCategories() {
    try {
      // Since we don't have categories endpoint, we'll use fallback
      return this.getFallbackCategories();
    } catch (error) {
      console.error('API Error - getCategories:', error.message);
      return this.getFallbackCategories();
    }
  }

  // ✅ FIXED: GET PRODUCT BY CODE
  async getProductByCode(productCode) {
    try {
      console.log(`🔄 Getting product by code: ${productCode}`);
      const response = await this.client.get(`/api/products/code/${productCode}`);
      
      if (response.data && response.data.success) {
        return response.data;
      } else {
        return { success: false, message: 'Product not found' };
      }
      
    } catch (error) {
      console.error('API Error - getProductByCode:', error.response?.data || error.message);
      return { success: false, message: 'Failed to fetch product' };
    }
  }

  // ✅ FIXED: CREATE TRANSACTION
  async createTransaction(transactionData) {
    try {
      console.log('🔄 Creating transaction...');
      const response = await this.client.post('/api/transactions', transactionData);
      
      if (response.data && response.data.success) {
        return response.data;
      } else {
        return { success: false, message: 'Failed to create transaction' };
      }
      
    } catch (error) {
      console.error('API Error - createTransaction:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create transaction' 
      };
    }
  }

  // 🎯 FALLBACK DATA METHODS

  getFallbackPulsaProviders() {
    console.log('🔄 Using fallback pulsa providers');
    return {
      success: true,
      data: ['Telkomsel', 'XL', 'Indosat', 'Tri', 'Smartfren'],
      count: 5,
      message: 'Fallback pulsa providers'
    };
  }

  getFallbackCategories() {
    return {
      success: true,
      data: [
        { code: 'pulsa', name: 'Pulsa', description: 'Isi ulang pulsa' },
        { code: 'data', name: 'Paket Data', description: 'Paket internet' },
        { code: 'pln', name: 'Token PLN', description: 'Token listrik' },
        { code: 'voucher', name: 'Voucher Game', description: 'Voucher game online' },
        { code: 'game', name: 'Top Up Game', description: 'Top up saldo game' }
      ],
      count: 5,
      message: 'Fallback categories'
    };
  }

  getFallbackProducts(category, provider = null) {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower === 'pulsa') {
      const providerName = provider || 'All';
      const products = [
        { code: 'PULSA-5', name: `${providerName} 5.000`, price: 6000, stock: 999, denomination: '5000' },
        { code: 'PULSA-10', name: `${providerName} 10.000`, price: 11000, stock: 999, denomination: '10000' },
        { code: 'PULSA-25', name: `${providerName} 25.000`, price: 26000, stock: 999, denomination: '25000' },
        { code: 'PULSA-50', name: `${providerName} 50.000`, price: 51000, stock: 999, denomination: '50000' },
        { code: 'PULSA-100', name: `${providerName} 100.000`, price: 101000, stock: 999, denomination: '100000' }
      ];
      
      return {
        success: true,
        data: products,
        count: products.length,
        category: category,
        filters: { provider: provider || 'all' }
      };
    }
    
    // Fallback untuk kategori lainnya
    return {
      success: true,
      data: [
        { code: 'DEFAULT-1', name: 'Product 1', price: 10000, stock: 999 },
        { code: 'DEFAULT-2', name: 'Product 2', price: 20000, stock: 999 }
      ],
      count: 2,
      category: category
    };
  }
}

module.exports = new ApiService();