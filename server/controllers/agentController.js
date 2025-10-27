const Agent = require('../models/Agent');
const Transaction = require('../models/Transaction');

// ✅ GET all agents
exports.getAllAgents = async (req, res) => {
    try {
        const agents = await Agent.find().sort({ createdAt: -1 });
        res.json({ 
            success: true, 
            data: agents 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// ✅ CREATE new agent
exports.createAgent = async (req, res) => {
    try {
        const { name, phone, email, telegramId, balance = 0 } = req.body;

        // Validasi required fields
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone are required'
            });
        }

        // Cek jika phone sudah terdaftar
        const existingAgent = await Agent.findOne({ phone });
        if (existingAgent) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already registered'
            });
        }

        // Cek jika telegramId sudah terdaftar
        if (telegramId) {
            const existingTelegramAgent = await Agent.findOne({ telegramId });
            if (existingTelegramAgent) {
                return res.status(400).json({
                    success: false,
                    message: 'Telegram ID already registered'
                });
            }
        }

        // Buat agent baru
        const agent = new Agent({
            name,
            phone,
            email,
            telegramId,
            balance: balance || 0,
            isActive: true
        });

        const savedAgent = await agent.save();

        res.status(201).json({
            success: true,
            message: 'Agent created successfully',
            data: savedAgent
        });

    } catch (error) {
        console.error('Create agent error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ TOP UP balance (placeholder)
exports.topUpBalance = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Top up feature coming soon'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ DEDUCT balance (placeholder)  
exports.deductBalance = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Deduct balance feature coming soon'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ GET agent transactions (placeholder)
exports.getAgentTransactions = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Transactions feature coming soon',
            data: []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ UPDATE agent (placeholder)
exports.updateAgent = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Update agent feature coming soon'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ DELETE agent (placeholder)
exports.deleteAgent = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Delete agent feature coming soon'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};