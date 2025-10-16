const express = require('express');
const router = express.Router();

// Simple categories route tanpa database
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        { _id: '1', name: 'Pulsa', description: 'Pulsa all operator', isActive: true },
        { _id: '2', name: 'Data', description: 'Paket internet', isActive: true },
        { _id: '3', name: 'E-money', description: 'E-money & QRIS', isActive: true }
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create category - simple version
router.post('/', async (req, res) => {
  try {
    res.status(201).json({
      success: true,
      data: req.body,
      message: 'Category created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
