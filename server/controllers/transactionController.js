

const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Agent = require('../models/Agent');
const DigiFlazzService = require('../services/DigiFlazzService');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private/Admin
const getTransactions = async (req, res) => {
  try {
    const {
      agentId,
      status,
      page = 1,
      limit = 50,
      startDate,
      endDate
    } = req.query;

    let filter = {};
    
    if (agentId) filter.agentTelegramId = agentId;
    if (status) filter.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const transactions = await Transaction.find(filter)
      .populate('productId', 'name category')
      .populate('agentId', 'firstName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get transactions by agent
// @route   GET /api/transactions/agent/:telegramId
// @access  Private/Agent
const getAgentTransactions = async (req, res) => {
  try {
    const { telegramId } = req.params;
    const { 
      status,
      page = 1,
      limit = 20
    } = req.query;

    let filter = { agentTelegramId: telegramId };
    if (status) filter.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const transactions = await Transaction.find(filter)
      .populate('productId', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private/Agent
const createTransaction = async (req, res) => {
  const session = await Transaction.startSession();
  session.startTransaction();

  try {
    const { productId, agentTelegramId, customerNo } = req.body;

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find or create agent
    let agent = await Agent.findOne({ telegramId: agentTelegramId });
    if (!agent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Agent not found. Please register first with /start'
      });
    }

    // Generate unique reference ID
    const refId = `TX${Date.now()}${agentTelegramId.slice(-4)}`;

    let transaction;
    let digiflazzResult;

    if (product.type === 'digiflazz') {
      // Process DigiFlazz transaction
      const digiflazzService = new DigiFlazzService();
      
      try {
        digiflazzResult = await digiflazzService.purchase(
          product.sku,
          customerNo,
          refId
        );

        transaction = new Transaction({
          productId,
          agentId: agent._id,
          agentTelegramId,
          customerNo,
          productName: product.name,
          productPrice: product.finalPrice,
          status: digiflazzResult.status === 'Sukses' ? 'success' : 'failed',
          sn: digiflazzResult.sn,
          refId,
          digiflazzResponse: digiflazzResult,
          commission: digiflazzResult.status === 'Sukses' ? 
            Math.round(product.finalPrice * (product.commissionRate / 100)) : 0
        });

      } catch (digiflazzError) {
        transaction = new Transaction({
          productId,
          agentId: agent._id,
          agentTelegramId,
          customerNo,
          productName: product.name,
          productPrice: product.finalPrice,
          status: 'failed',
          refId,
          errorMessage: digiflazzError.message
        });
      }
    } else {
      // Process custom product transaction
      transaction = new Transaction({
        productId,
        agentId: agent._id,
        agentTelegramId,
        customerNo,
        productName: product.name,
        productPrice: product.finalPrice,
        status: 'pending', // Custom products need manual processing
        refId,
        commission: Math.round(product.finalPrice * (product.commissionRate / 100))
      });
    }

    await transaction.save({ session });

    // Update agent stats if transaction successful
    if (transaction.status === 'success') {
      agent.balance += transaction.commission;
      agent.totalCommission += transaction.commission;
      agent.totalSales += product.finalPrice;
      agent.totalTransactions += 1;
      await agent.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: transaction,
      message: transaction.status === 'success' ? 
        'Transaction completed successfully' : 
        'Transaction failed'
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private/Admin
const getTransactionStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalTransactions = await Transaction.countDocuments();
    const todayTransactions = await Transaction.countDocuments({
      createdAt: { $gte: today }
    });
    const successTransactions = await Transaction.countDocuments({
      status: 'success'
    });
    const totalSales = await Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$productPrice' } } }
    ]);
    const totalCommission = await Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$commission' } } }
    ]);

    const stats = {
      totalTransactions,
      todayTransactions,
      successTransactions,
      failedTransactions: totalTransactions - successTransactions,
      successRate: totalTransactions > 0 ? 
        Math.round((successTransactions / totalTransactions) * 100) : 0,
      totalSales: totalSales[0]?.total || 0,
      totalCommission: totalCommission[0]?.total || 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getTransactions,
  getAgentTransactions,
  createTransaction,
  getTransactionStats
};