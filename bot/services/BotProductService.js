const StorageService = require('../../server/services/StorageService');

class BotProductService {
    static async getProductsForBot() {
        try {
            const products = await StorageService.getActiveProducts();
            console.log(`📦 Loaded ${products.length} products for bot`);
            return products;
        } catch (error) {
            console.error('Error getting products for bot:', error);
            return [];
        }
    }
    
    static async findProductForBot(code) {
        try {
            console.log(`🔍 Searching product: ${code}`);
            const product = await StorageService.findActiveProduct(code);
            
            if (product) {
                console.log(`✅ Product found: ${product.name} (${product.price})`);
            } else {
                console.log(`❌ Product not found: ${code}`);
            }
            
            return product;
        } catch (error) {
            console.error('Error finding product for bot:', error);
            return null;
        }
    }
    
    static async getPulsaProducts() {
        try {
            const allProducts = await this.getProductsForBot();
            
            // Filter produk pulsa berdasarkan operator
            const pulsaOperators = ['AXIS', 'TRI', 'XL', 'INDOSAT', 'TELKOMSEL', 'SMARTFREN', 'BY.U', '3'];
            const pulsaProducts = allProducts.filter(product => 
                pulsaOperators.includes(product.operator.toUpperCase())
            );
            
            console.log(`📱 Found ${pulsaProducts.length} pulsa products`);
            return pulsaProducts;
        } catch (error) {
            console.error('Error getting pulsa products:', error);
            return [];
        }
    }
    
    static async getProductsByCategory(category) {
    try {
        const allProducts = await this.getProductsForBot();
        
        // Filter by category
        const categoryProducts = allProducts.filter(product => 
            product.category && product.category.toLowerCase() === category.toLowerCase()
        );
        
        console.log(`📂 Found ${categoryProducts.length} products in category: ${category}`);
        return categoryProducts;
    } catch (error) {
        console.error('Error getting products by category:', error);
        return [];
    }
}

static async getAllCategories() {
    // Return semua kategori yang tersedia
    return ['pulsa', 'pln', 'game', 'data', 'ewallet', 'tv'];
}

 static async getPriceListByOperator(operator) {
        try {
            const allProducts = await this.getProductsForBot();
            
            // Filter by operator dan urutkan by price
            const operatorProducts = allProducts
                .filter(product => 
                    product.operator && 
                    product.operator.toLowerCase() === operator.toLowerCase()
                )
                .sort((a, b) => a.price - b.price);

            console.log(`💰 Found ${operatorProducts.length} products for ${operator}`);
            return operatorProducts;
        } catch (error) {
            console.error('Error getting price list:', error);
            return [];
        }
    }

    static async getAllOperators() {
        // Return semua operator yang tersedia
        return [
            'AXIS', 'XL', 'TELKOMSEL', 'INDOSAT', 'SMARTFREN', 'TRI', 'BY.U'
        ];
    }

    static async getPriceRanges() {
        // Return range harga untuk setiap operator
        return {
            'AXIS': [
                { min: 1000, max: 5000, increment: 1000 },
                { min: 6000, max: 100000, increment: 1000 }
            ],
            'XL': [
                { min: 1000, max: 5000, increment: 1000 },
                { min: 6000, max: 200000, increment: 1000 }
            ],
            'TELKOMSEL': [
                { min: 1000, max: 5000, increment: 1000 },
                { min: 6000, max: 500000, increment: 1000 }
            ],
            'INDOSAT': [
                { min: 1000, max: 5000, increment: 1000 },
                { min: 6000, max: 200000, increment: 1000 }
            ],
            'SMARTFREN': [
                { min: 1000, max: 5000, increment: 1000 },
                { min: 6000, max: 100000, increment: 1000 }
            ],
            'TRI': [
                { min: 1000, max: 5000, increment: 1000 },
                { min: 6000, max: 100000, increment: 1000 }
            ]
        };
    }
}
      // Sample data produk dengan range lengkap
const sampleProducts = [
    // AXIS
    { code: "AX1", name: "Axis 1K", price: 1500, operator: "AXIS", category: "pulsa" },
    { code: "AX5", name: "Axis 5K", price: 6000, operator: "AXIS", category: "pulsa" },
    { code: "AX10", name: "Axis 10K", price: 11000, operator: "AXIS", category: "pulsa" },
    { code: "AX25", name: "Axis 25K", price: 26000, operator: "AXIS", category: "pulsa" },
    { code: "AX50", name: "Axis 50K", price: 51000, operator: "AXIS", category: "pulsa" },
    { code: "AX100", name: "Axis 100K", price: 101000, operator: "AXIS", category: "pulsa" },
    
    // XL
    { code: "XL1", name: "XL 1K", price: 1500, operator: "XL", category: "pulsa" },
    { code: "XL5", name: "XL 5K", price: 6000, operator: "XL", category: "pulsa" },
    { code: "XL10", name: "XL 10K", price: 11000, operator: "XL", category: "pulsa" },
    { code: "XL25", name: "XL 25K", price: 26000, operator: "XL", category: "pulsa" },
    { code: "XL50", name: "XL 50K", price: 51000, operator: "XL", category: "pulsa" },
    { code: "XL100", name: "XL 100K", price: 101000, operator: "XL", category: "pulsa" },
    { code: "XL150", name: "XL 150K", price: 151000, operator: "XL", category: "pulsa" },
    { code: "XL200", name: "XL 200K", price: 201000, operator: "XL", category: "pulsa" },
    
    // TELKOMSEL
    { code: "TS1", name: "Telkomsel 1K", price: 1500, operator: "TELKOMSEL", category: "pulsa" },
    { code: "TS5", name: "Telkomsel 5K", price: 6000, operator: "TELKOMSEL", category: "pulsa" },
    { code: "TS10", name: "Telkomsel 10K", price: 11000, operator: "TELKOMSEL", category: "pulsa" },
    { code: "TS25", name: "Telkomsel 25K", price: 26000, operator: "TELKOMSEL", category: "pulsa" },
    { code: "TS50", name: "Telkomsel 50K", price: 51000, operator: "TELKOMSEL", category: "pulsa" },
    { code: "TS100", name: "Telkomsel 100K", price: 101000, operator: "TELKOMSEL", category: "pulsa" },
    { code: "TS200", name: "Telkomsel 200K", price: 201000, operator: "TELKOMSEL", category: "pulsa" },
    { code: "TS300", name: "Telkomsel 300K", price: 301000, operator: "TELKOMSEL", category: "pulsa" },
    { code: "TS500", name: "Telkomsel 500K", price: 501000, operator: "TELKOMSEL", category: "pulsa" },
    
    // INDOSAT
    { code: "IS1", name: "Indosat 1K", price: 1500, operator: "INDOSAT", category: "pulsa" },
    { code: "IS5", name: "Indosat 5K", price: 6000, operator: "INDOSAT", category: "pulsa" },
    { code: "IS10", name: "Indosat 10K", price: 11000, operator: "INDOSAT", category: "pulsa" },
    { code: "IS25", name: "Indosat 25K", price: 26000, operator: "INDOSAT", category: "pulsa" },
    { code: "IS50", name: "Indosat 50K", price: 51000, operator: "INDOSAT", category: "pulsa" },
    { code: "IS100", name: "Indosat 100K", price: 101000, operator: "INDOSAT", category: "pulsa" },
    { code: "IS200", name: "Indosat 200K", price: 201000, operator: "INDOSAT", category: "pulsa" },
    
    // SMARTFREN
    { code: "SF1", name: "Smartfren 1K", price: 1500, operator: "SMARTFREN", category: "pulsa" },
    { code: "SF5", name: "Smartfren 5K", price: 6000, operator: "SMARTFREN", category: "pulsa" },
    { code: "SF10", name: "Smartfren 10K", price: 11000, operator: "SMARTFREN", category: "pulsa" },
    { code: "SF25", name: "Smartfren 25K", price: 26000, operator: "SMARTFREN", category: "pulsa" },
    { code: "SF50", name: "Smartfren 50K", price: 51000, operator: "SMARTFREN", category: "pulsa" },
    { code: "SF100", name: "Smartfren 100K", price: 101000, operator: "SMARTFREN", category: "pulsa" },
    
    // TRI
    { code: "TRI1", name: "Tri 1K", price: 1500, operator: "TRI", category: "pulsa" },
    { code: "TRI5", name: "Tri 5K", price: 6000, operator: "TRI", category: "pulsa" },
    { code: "TRI10", name: "Tri 10K", price: 11000, operator: "TRI", category: "pulsa" },
    { code: "TRI25", name: "Tri 25K", price: 26000, operator: "TRI", category: "pulsa" },
    { code: "TRI50", name: "Tri 50K", price: 51000, operator: "TRI", category: "pulsa" },
    { code: "TRI100", name: "Tri 100K", price: 101000, operator: "TRI", category: "pulsa" }
];


module.exports = BotProductService;
