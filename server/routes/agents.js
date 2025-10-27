const express = require('express');
const router = express.Router();
const {
    getAllAgents,
    createAgent,
    topUpBalance,
    deductBalance,
    getAgentTransactions,
    updateAgent,
    deleteAgent
} = require('../controllers/agentController');

// ✅ GET /api/agents - Get all agents
router.get('/', getAllAgents);

// ✅ POST /api/agents - Create new agent
router.post('/', createAgent);

// ✅ POST /api/agents/:id/topup - Top up balance
router.post('/:id/topup', topUpBalance);

// ✅ POST /api/agents/:id/deduct - Deduct balance  
router.post('/:id/deduct', deductBalance);

// ✅ GET /api/agents/:id/transactions - Get agent transactions
router.get('/:id/transactions', getAgentTransactions);

// ✅ PUT /api/agents/:id - Update agent
router.put('/:id', updateAgent);

// ✅ DELETE /api/agents/:id - Delete agent
router.delete('/:id', deleteAgent);

module.exports = router;