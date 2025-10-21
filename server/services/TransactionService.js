// services/TransactionService.js - FIXED
const Product = require('../models/Product'); // ⭐⭐⭐ IMPORT DARI MODELS ⭐⭐⭐
const DigiFlazzService = require('./DigiFlazzService');

// ⭐⭐⭐ HAPUS MODEL DEFINITION INI ⭐⭐⭐
// const productSchema = new mongoose.Schema({ ... });
// const Product = mongoose.model('Product', productSchema);

class TransactionService {
  constructor() {
    this.digiflazz = new DigiFlazzService();
  }

  async processPurchase(agentId, productCode, customerNumber) {
    try {
      console.log(`🛒 Processing: ${productCode} for ${customerNumber}`);
      
      // 1. CHECK PRODUCT IN DATABASE
      const product = await Product.findOne({ code: productCode, status: 'active' });
      if (!product) {
        console.log(`❌ Product ${productCode} not in database`);
        throw new Error(`Product "${productCode}" tidak ditemukan. Coba sync products dulu.`);
      }
      
      console.log(`✅ Product found: ${product.name} - Rp ${product.selling_price}`);
      
      // 2. MOCK TRANSACTION
      const transactionId = 'MOCK' + Date.now();
      const mockTransaction = {
        transaction_id: transactionId,
        product_code: product.code,
        product_name: product.name,
        customer_number: customerNumber,
        agent_id: agentId,
        base_price: product.base_price,
        selling_price: product.selling_price,
        profit: product.profit,
        status: 'success',
        message: 'MOCK TRANSACTION - DigiFlazz balance is 0'
      };
      
      return {
        success: true,
        message: `✅ MOCK: ${product.name} untuk ${customerNumber} berhasil!`,
        data: mockTransaction
      };
      
    } catch (error) {
      console.error('❌ Transaction error:', error.message);
      throw error;
    }
  }
}

module.exports = TransactionService;
