const express = require('express');
const router = express.Router();

// Temporary route tanpa model
router.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Products API is working!',
    data: [
      { id: 1, name: 'Pulsa 5.000', price: 6000, category: 'pulsa' },
      { id: 2, name: 'Pulsa 10.000', price: 11000, category: 'pulsa' }
    ]
  });
});

module.exports = router;