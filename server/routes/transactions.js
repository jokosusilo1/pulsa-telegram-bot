
const express = require('express');
const Transaction = require('../models/Transactions');
const DigiFlazzService = require('../services/DigiFlazzService');
const router = express.Router();

// POST /api/transactions - Create new transaction
router.post('/', async (req, res) => {
  try {
    const { productId, agentTelegramId, customerNo, productSku } = req.body;
    
    // Find agent
    const Agent = require('../models/Agent');
    const agent = await Agent.findOne({ telegramId: agentTelegramId });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Find product
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Process transaction
    const digiflazz = new DigiFlazzService();
    const refId = `TX${Date.now()}${agent.telegramId}`;
    
    const result = await digiflazz.purchase(productSku || product.sku, customerNo, refId);
    
    // Create transaction record
    const transaction = new Transaction({
      productId,
      agentId: agent._id,
      agentTelegramId: agent.telegramId,
      customerNo,
      productName: product.name,
      productPrice: product.finalPrice,
      status: result.status === 'Sukses' ? 'success' : 'failed',
      sn: result.sn,
      refId,
      digiflazzResponse: result
    });
    
    await transaction.save();
    
    // Update agent stats if successful
    if (transaction.status === 'success') {
      agent.totalSales += product.finalPrice;
      const commission = Math.round(product.finalPrice * 0.05); // 5% commission
      agent.balance += commission;
      agent.totalCommission += commission;
      await agent.save();
      
      transaction.commission = commission;
      await transaction.save();
    }
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/transactions - Get all transactions
router.get('/', async (req, res) => {
  try {
    const { agentId, status, limit = 50 } = req.query;
    let filter = {};
    
    if (agentId) filter.agentTelegramId = agentId;
    if (status) filter.status = status;
    
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
