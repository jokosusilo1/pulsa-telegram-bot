const StorageService = require('../services/StorageService');
const ProductSyncService = require('../services/ProductSyncService');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await StorageService.getActiveProducts();
        
        res.json({
            success: true,
            data: products,
            count: products.length,
            message: products.length === 0 ? 'No active products found' : 'Active products retrieved'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const products = await StorageService.getActiveProductsByCategory(category);
        
        res.json({
            success: true,
            data: products,
            count: products.length,
            message: products.length === 0 ? `No active products in category ${category}` : `Active products in ${category}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// **UPDATE: Pakai ProductSyncService yang baru**
exports.syncProducts = async (req, res) => {
    try {
        const result = await ProductSyncService.syncProducts();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProductByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const product = await StorageService.findActiveProduct(code);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// **NEW: Check DigiFlazz balance**
exports.checkBalance = async (req, res) => {
    try {
        const result = await ProductSyncService.checkDigiflazzBalance();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
