
const express = require('express');
const Agent = require('../models/Agent');
const router = express.Router();

// GET /api/agents - Get all agents
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/agents - Register new agent
router.post('/', async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName, phone } = req.body;
    
    // Check if agent already exists
    let agent = await Agent.findOne({ telegramId });
    if (agent) {
      return res.json(agent);
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
    res.status(201).json(agent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/agents/:telegramId - Get agent by Telegram ID
router.get('/:telegramId', async (req, res) => {
  try {
    const agent = await Agent.findOne({ telegramId: req.params.telegramId });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/agents/:id - Update agent
router.put('/:id', async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
