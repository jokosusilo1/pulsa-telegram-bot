const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductsByCategory,
    getProductByCode,
    getPulsaProviders,
    createProduct,
    bulkCreateProducts
} = require('../controllers/productController');

// ✅ GET /api/products - Get all products
router.get('/', getAllProducts);

// ✅ GET /api/products/category/:category - Get products by category
router.get('/category/:category', getProductsByCategory);

// ✅ GET /api/products/code/:code - Get product by code
router.get('/code/:code', getProductByCode);

// ✅ GET /api/products/pulsa/providers - Get all pulsa providers (Baru!)
router.get('/pulsa/providers', getPulsaProviders);

// ✅ POST /api/products - Create single product (Admin)
router.post('/', createProduct);

// ✅ POST /api/products/bulk - Bulk create products (Admin)
router.post('/bulk', bulkCreateProducts);

module.exports = router;