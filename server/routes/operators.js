// server/routes/operators.js
const express = require('express');
const router = express.Router();

// ⭐⭐⭐ DEFAULT OPERATORS DATA ⭐⭐⭐
const defaultOperators = [
  { code: 'telkomsel', name: 'Telkomsel', type: 'pulsa', category: 'telkomsel', status: 'active', icon: '📱' },
  { code: 'indosat', name: 'Indosat', type: 'pulsa', category: 'indosat', status: 'active', icon: '📱' },
  { code: 'xl', name: 'XL', type: 'pulsa', category: 'xl', status: 'active', icon: '📱' },
  { code: 'axis', name: 'AXIS', type: 'pulsa', category: 'axis', status: 'active', icon: '📱' },
  { code: 'three', name: '3 (Three)', type: 'pulsa', category: 'three', status: 'active', icon: '📱' },
  { code: 'smartfren', name: 'Smartfren', type: 'pulsa', category: 'smartfren', status: 'active', icon: '📱' },
  { code: 'data', name: 'Paket Data', type: 'data', category: 'data', status: 'active', icon: '📶' },
  { code: 'pln', name: 'Token PLN', type: 'pln', category: 'pln', status: 'active', icon: '⚡' }
];

// ⭐⭐⭐ GET ALL OPERATORS ⭐⭐⭐
router.get('/', (req, res) => {
  console.log('📡 GET /api/operators - Returning default operators');
  
  res.json({
    success: true,
    data: defaultOperators,
    count: defaultOperators.length,
    message: 'Operators retrieved successfully'
  });
});

// ⭐⭐⭐ GET OPERATOR BY CODE ⭐⭐⭐
router.get('/:code', (req, res) => {
  const { code } = req.params;
  console.log(`📡 GET /api/operators/${code}`);
  
  const operator = defaultOperators.find(op => op.code === code);
  
  if (!operator) {
    return res.status(404).json({
      success: false,
      message: 'Operator not found'
    });
  }
  
  res.json({
    success: true,
    data: operator
  });
});

module.exports = router;