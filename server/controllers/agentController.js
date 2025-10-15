

const Agent = require('../models/Agent');

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private/Admin
const getAgents = async (req, res) => {
  try {
    const { 
      active = 'true',
      page = 1,
      limit = 50
    } = req.query;

    let filter = {};
    if (active !== undefined) filter.isActive = active === 'true';

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const agents = await Agent.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v')
      .lean();

    const total = await Agent.countDocuments(filter);

    res.json({
      success: true,
      data: agents,
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

// @desc    Get agent by Telegram ID
// @route   GET /api/agents/telegram/:telegramId
// @access  Private/Agent
const getAgentByTelegramId = async (req, res) => {
  try {
    const agent = await Agent.findOne({ 
      telegramId: req.params.telegramId 
    }).select('-__v');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register new agent
// @route   POST /api/agents
// @access  Public
const registerAgent = async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName, phone } = req.body;

    // Check if agent already exists
    let agent = await Agent.findOne({ telegramId });
    if (agent) {
      return res.json({
        success: true,
        data: agent,
        message: 'Agent already exists'
      });
    }

    // Create new agent
    agent = new Agent({
      telegramId,
      username,
      firstName,
      lastName,
      phone
    });

    await agent.save();

    res.status(201).json({
      success: true,
      data: agent,
      message: 'Agent registered successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private/Admin
const updateAgent = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      data: agent,
      message: 'Agent updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get agent dashboard stats
// @route   GET /api/agents/:telegramId/dashboard
// @access  Private/Agent
const getAgentDashboard = async (req, res) => {
  try {
    const { telegramId } = req.params;
    
    const agent = await Agent.findOne({ telegramId });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const Transaction = require('../models/Transaction');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = await Transaction.countDocuments({
      agentTelegramId: telegramId,
      createdAt: { $gte: today },
      status: 'success'
    });

    const totalTransactions = await Transaction.countDocuments({
      agentTelegramId: telegramId,
      status: 'success'
    });

    const dashboardData = {
      agent: {
        firstName: agent.firstName,
        username: agent.username,
        level: agent.level,
        balance: agent.balance,
        totalCommission: agent.totalCommission,
        totalSales: agent.totalSales
      },
      stats: {
        todayTransactions,
        totalTransactions,
        successRate: totalTransactions > 0 ? 
          Math.round((totalTransactions / (totalTransactions + await Transaction.countDocuments({
            agentTelegramId: telegramId,
            status: 'failed'
          }))) * 100) : 0
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAgents,
  getAgentByTelegramId,
  registerAgent,
  updateAgent,
  getAgentDashboard
};