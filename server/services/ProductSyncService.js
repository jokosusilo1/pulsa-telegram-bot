const DigiFlazzService = require('./DigiFlazzService');
const StorageService = require('./StorageService');

class ProductSyncService {
    constructor() {
        this.digiflazz = new DigiFlazzService();
    }
    
    async syncProducts() {
        try {
            console.log('🔄 Syncing products from DigiFlazz...');
            
            // 1. Ambil produk dari DigiFlazz
            const digiflazzProducts = await this.digiflazz.getPriceList();
            console.log(`📦 Received ${digiflazzProducts?.length || 0} products from DigiFlazz`);
            
            if (!digiflazzProducts || digiflazzProducts.length === 0) {
                // Fallback ke default products
                console.log('🔄 Using default products as fallback');
                const defaultProducts = this.getDefaultProducts();
                const result = await StorageService.saveProducts(defaultProducts);
                return {
                    success: true,
                    count: result.count,
                    message: `Used ${result.count} default products (DigiFlazz empty)`
                };
            }
            
            // 2. Format produk dengan mapping kategori yang diperbaiki
            const formattedProducts = this.formatProductsForStorage(digiflazzProducts);
            
            // 3. Simpan ke storage
            const result = await StorageService.saveProducts(formattedProducts);
            
            console.log(`✅ ${result.count} products saved to storage`);
            return {
                success: true,
                count: result.count,
                message: `Successfully synced ${result.count} products to storage`
            };
            
        } catch (error) {
            console.error('❌ Sync failed:', error.message);
            
            // Fallback jika semua gagal
            console.log('🔄 Using default products as emergency fallback');
            const defaultProducts = this.getDefaultProducts();
            await StorageService.saveProducts(defaultProducts);
            
            return {
                success: true,
                count: defaultProducts.length,
                message: `Used ${defaultProducts.length} default products (Sync failed)`
            };
        }
    }
    
    formatProductsForStorage(digiflazzProducts) {
        return digiflazzProducts.map(product => ({
            code: product.buyer_sku_code,
            name: product.product_name,
            price: product.price,
            commission: Math.max(Math.floor(product.price * 0.05), 100),
            category: this.mapCategory(product.product_name, product.brand),
            operator: product.brand || 'UNKNOWN',
            status: 'active',
            originalData: product
        }));
    }
    
    // ✅ IMPROVED MAPCATEGORY FUNCTION
    mapCategory(productName, operator) {
        const name = (productName || '').toLowerCase();
        const op = (operator || '').toUpperCase();
        
        // 1. Deteksi berdasarkan operator terlebih dahulu (paling akurat)
        const telcoOperators = ['AXIS', 'TRI', 'XL', 'INDOSAT', 'TELKOMSEL', 'SMARTFREN', 'BY.U', '3'];
        const dataOperators = ['AXIS DATA', 'TRI DATA', 'XL DATA', 'INDOSAT DATA'];
        const plnOperators = ['PLN', 'TOKEN LISTRIK'];
        
        if (telcoOperators.includes(op)) {
            return 'pulsa';
        }
        if (dataOperators.includes(op)) {
            return 'data';
        }
        if (plnOperators.includes(op)) {
            return 'pln';
        }
        
        // 2. Deteksi berdasarkan nama produk
        if (name.includes('pulsa')) return 'pulsa';
        
        // Deteksi paket data
        if (name.includes('data') || name.includes('internet') || name.includes('kuota')) {
            return 'data';
        }
        
        // Deteksi token listrik
        if (name.includes('token') || name.includes('listrik') || name.includes('pln')) {
            return 'pln';
        }
        
        // Deteksi game/voucher
        if (name.includes('game') || name.includes('voucher game') || name.includes('steam') || 
            name.includes('mobile legend') || name.includes('free fire')) {
            return 'game';
        }
        
        // Deteksi e-money
        if (name.includes('e-money') || name.includes('ewallet') || name.includes('gopay') || 
            name.includes('ovo') || name.includes('dana') || name.includes('linkaja')) {
            return 'emoney';
        }
        
        // Deteksi voucher
        if (name.includes('voucher') && !name.includes('game')) {
            return 'voucher';
        }
        
        // Deteksi BPJS
        if (name.includes('bpjs')) {
            return 'bpjs';
        }
        
        // Deteksi paket nelpon
        if (name.includes('nelpon') || name.includes('telepon') || name.includes('call')) {
            return 'telepon';
        }
        
        // Deteksi SMS
        if (name.includes('sms')) {
            return 'sms';
        }
        
        return 'other';
    }
    
    // ✅ Method untuk mendapatkan kategori berdasarkan pattern
    detectCategoryByPattern(name) {
        const patterns = {
            pulsa: [
                /\d+,?\.?\d*\s?(k|rb|ribu)/i,  // Pattern nominal: 10k, 25rb, 100ribu
                /pulsa\s+\d+/i,                // Pattern: pulsa 10, pulsa 25
                /^(axis|tri|xl|indosat|telkomsel|smartfren|by\.u|3)\s+\d+/i // Pattern: axis 10, xl 25
            ],
            data: [
                /(\d+\s?gb|\d+\s?mb)/i,        // Pattern: 1GB, 5 GB, 500MB
                /internet/i,
                /kuota/i
            ],
            pln: [
                /token\s+listrik/i,
                /pln\s+(token|pra|pascabayar)/i
            ]
        };
        
        for (const [category, patternList] of Object.entries(patterns)) {
            for (const pattern of patternList) {
                if (pattern.test(name)) {
                    return category;
                }
            }
        }
        
        return 'other';
    }
    
    generateSignature() {
        const crypto = require('crypto');
        return crypto.createHash('md5')
            .update(process.env.DIGIFLAZZ_USERNAME + process.env.DIGIFLAZZ_API_KEY + "pricelist")
            .digest('hex');
    }
    
    getDefaultProducts() {
        console.log('🔄 Using default products as fallback');
        return [
            {
                code: "pulsa5",
                name: "Pulsa 5.000",
                price: 6000,
                commission: 300,
                category: "pulsa",
                operator: "ALL",
                status: "active"
            },
            {
                code: "pulsa10", 
                name: "Pulsa 10.000",
                price: 11000,
                commission: 500,
                category: "pulsa",
                operator: "ALL",
                status: "active"
            },
            {
                code: "pulsa25",
                name: "Pulsa 25.000", 
                price: 26000,
                commission: 1000,
                category: "pulsa",
                operator: "ALL",
                status: "active"
            },
            {
                code: "pulsa50",
                name: "Pulsa 50.000",
                price: 51000, 
                commission: 2000,
                category: "pulsa",
                operator: "ALL",
                status: "active"
            },
            {
                code: "pulsa100",
                name: "Pulsa 100.000",
                price: 101000,
                commission: 4000,
                category: "pulsa", 
                operator: "ALL",
                status: "active"
            },
            {
                code: "data1gb",
                name: "Paket Data 1GB",
                price: 15000,
                commission: 750,
                category: "data",
                operator: "ALL",
                status: "active"
            },
            {
                code: "pln20k",
                name: "Token Listrik 20.000",
                price: 20000,
                commission: 1000,
                category: "pln",
                operator: "PLN",
                status: "active"
            }
        ];
    }
    
    // Method untuk purchase menggunakan DigiFlazz asli
    async purchaseProduct(sku, customerNo, refId) {
        try {
            const result = await this.digiflazz.purchase(sku, customerNo, refId);
            return {
                success: true,
                data: result,
                message: 'Purchase successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }
    
    // Cek saldo DigiFlazz
    async checkDigiflazzBalance() {
        try {
            const balance = await this.digiflazz.checkBalance();
            return {
                success: true,
                data: balance,
                message: 'Balance retrieved'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new ProductSyncService();
