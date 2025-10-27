const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const sampleProducts = [
    // PULSA
    {
        code: '5',
        name: 'Telkomsel 5.000',
        category: 'Pulsa',
        price: 6000,
        description: 'Pulsa Telkomsel 5.000',
        provider: 'Telkomsel',
        denomination: '5.000',
        stock: 999,
        isActive: true
    },
    {
        code: '10',
        name: 'Telkomsel 10.000',
        category: 'Pulsa',
        price: 11000,
        description: 'Pulsa Telkomsel 10.000',
        provider: 'Telkomsel',
        denomination: '10.000',
        stock: 999,
        isActive: true
    },
    {
        code: '25',
        name: 'Telkomsel 25.000',
        category: 'Pulsa',
        price: 26000,
        description: 'Pulsa Telkomsel 25.000',
        provider: 'Telkomsel',
        denomination: '25.000',
        stock: 999,
        isActive: true
    },
    {
        code: '50',
        name: 'Telkomsel 50.000',
        category: 'Pulsa',
        price: 51000,
        description: 'Pulsa Telkomsel 50.000',
        provider: 'Telkomsel',
        denomination: '50.000',
        stock: 999,
        isActive: true
    },
    {
        code: '100',
        name: 'Telkomsel 100.000',
        category: 'Pulsa',
        price: 101000,
        description: 'Pulsa Telkomsel 100.000',
        provider: 'Telkomsel',
        denomination: '100.000',
        stock: 999,
        isActive: true
    },

    // DATA
    {
        code: 'AXIS1GB',
        name: 'AXIS 1GB',
        category: 'Data',
        price: 8000,
        description: 'AXIS 1GB 24 Jam',
        provider: 'AXIS',
        denomination: '1GB',
        validity: '30 Hari',
        stock: 999,
        isActive: true
    },
    {
        code: 'AXIS3GB',
        name: 'AXIS 3GB',
        category: 'Data',
        price: 20000,
        description: 'AXIS 3GB 24 Jam',
        provider: 'AXIS',
        denomination: '3GB',
        validity: '30 Hari',
        stock: 999,
        isActive: true
    },
    {
        code: 'AXIS8GB',
        name: 'AXIS 8GB',
        category: 'Data',
        price: 50000,
        description: 'AXIS 8GB 24 Jam',
        provider: 'AXIS',
        denomination: '8GB',
        validity: '30 Hari',
        stock: 999,
        isActive: true
    },

    // PLN
    {
        code: 'PLN20',
        name: 'Token PLN 20.000',
        category: 'PLN',
        price: 21000,
        description: 'Token Listrik PLN 20.000',
        provider: 'PLN',
        denomination: '20.000',
        stock: 999,
        isActive: true
    },
    {
        code: 'PLN50',
        name: 'Token PLN 50.000',
        category: 'PLN',
        price: 51000,
        description: 'Token Listrik PLN 50.000',
        provider: 'PLN',
        denomination: '50.000',
        stock: 999,
        isActive: true
    },
    {
        code: 'PLN100',
        name: 'Token PLN 100.000',
        category: 'PLN',
        price: 101000,
        description: 'Token Listrik PLN 100.000',
        provider: 'PLN',
        denomination: '100.000',
        stock: 999,
        isActive: true
    }
];

async function addSampleProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Hapus products lama (optional)
        await Product.deleteMany({});
        console.log('✅ Cleared existing products');

        // Tambah products baru
        const result = await Product.insertMany(sampleProducts);
        console.log(`✅ Added ${result.length} sample products`);

        // Tampilkan summary
        const categories = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        
        console.log('\n📦 PRODUCTS SUMMARY:');
        categories.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count} products`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addSampleProducts();
