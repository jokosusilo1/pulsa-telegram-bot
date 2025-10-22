const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getByCategory,
    syncProducts,
    getProductByCode,
    checkBalance
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/category/:category', getByCategory);
router.get('/code/:code', getProductByCode);
router.post('/sync', syncProducts);
router.get('/balance', checkBalance); // **NEW: Check balance endpoint**

module.exports = router;
