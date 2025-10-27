const Product = require('../models/Product');

// ✅ GET ALL PRODUCTS
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ price: 1 });
        
        res.json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
};

// ✅ GET PRODUCTS BY CATEGORY (Dengan Filter Tambahan)
exports.getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { provider, denomination } = req.query; // ✅ Tambahkan filter
        
        // Format category (first letter uppercase) untuk match dengan enum
        const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
        
        // Build filter object
        let filter = { 
            category: formattedCategory,
            isActive: true 
        };
        
        // ✅ Filter by provider jika ada (untuk pulsa/operator)
        if (provider) {
            filter.provider = { $regex: provider, $options: 'i' }; // Case insensitive
        }
        
        // ✅ Filter by denomination jika ada (untuk nominal pulsa)
        if (denomination) {
            filter.denomination = denomination;
        }
        
        const products = await Product.find(filter).sort({ price: 1 });

        res.json({
            success: true,
            data: products,
            count: products.length,
            category: formattedCategory,
            filters: {
                provider: provider || 'all',
                denomination: denomination || 'all'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ GET PRODUCT BY CODE
exports.getProductByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const product = await Product.findOne({ 
            code: code,
            isActive: true 
        });

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

// ✅ CREATE PRODUCT (Admin)
exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: savedProduct
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Product code already exists'
            });
        }
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ BULK CREATE PRODUCTS
exports.bulkCreateProducts = async (req, res) => {
    try {
        const { products } = req.body;

        if (!products || !Array.isArray(products)) {
            return res.status(400).json({
                success: false,
                message: 'Products array is required'
            });
        }

        const results = await Product.insertMany(products, { ordered: false });
        
        res.status(201).json({
            success: true,
            message: `${results.length} products created successfully`,
            data: results
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ GET PULSA PROVIDERS (Endpoint Baru)
exports.getPulsaProviders = async (req, res) => {
    try {
        const providers = await Product.distinct('provider', { 
            category: 'Pulsa',
            isActive: true,
            provider: { $ne: null } // Exclude null values
        });
        
        res.json({
            success: true,
            data: providers.sort(),
            count: providers.length
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};