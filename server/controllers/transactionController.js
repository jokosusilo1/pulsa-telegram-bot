// controllers/TransactionController.js
const TransactionService = require('../services/TransactionService');

class TransactionController {
  constructor() {
    this.transactionService = new TransactionService();
  }

  // Proses pembelian
  async purchase(req, res) {
    try {
      const { product_code, customer_number, agent_id } = req.body;
      
      console.log(`🛒 Purchase request:`, { product_code, customer_number, agent_id });

      // Validasi input
      if (!product_code || !customer_number || !agent_id) {
        return res.status(400).json({
          success: false,
          message: 'product_code, customer_number, dan agent_id harus diisi'
        });
      }

      const result = await this.transactionService.processPurchase(
        agent_id,
        product_code,
        customer_number
      );

      res.json(result);

    } catch (error) {
      console.error('❌ Purchase controller error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cek status transaksi
  async checkStatus(req, res) {
    try {
      const { transaction_id } = req.params;
      
      const transaction = await this.transactionService.checkTransaction(transaction_id);
      
      res.json({
        success: true,
        data: transaction
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Riwayat transaksi
  async getHistory(req, res) {
    try {
      const { agent_id } = req.query;
      const limit = parseInt(req.query.limit) || 10;
      
      if (!agent_id) {
        return res.status(400).json({
          success: false,
          message: 'agent_id harus diisi'
        });
      }

      const transactions = await this.transactionService.getAgentTransactions(agent_id, limit);
      
      res.json({
        success: true,
        data: transactions,
        total: transactions.length
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = TransactionController;
