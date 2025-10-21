// test-simple.js - Test tanpa database dulu
require('dotenv').config();

console.log('🧪 SIMPLE DIGIFLAZZ TEST\n');

console.log('🔍 ENVIRONMENT:');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('   DIGIFLAZZ_USERNAME:', process.env.DIGIFLAZZ_USERNAME ? 'SET' : 'NOT SET');
console.log('   DIGIFLAZZ_API_KEY:', process.env.DIGIFLAZZ_API_KEY ? 'SET' : 'NOT SET');

// Test DigiFlazz langsung
const DigiFlazzService = require('./server/services/DigiFlazzService');

const test = async () => {
  try {
    const digiflazz = new DigiFlazzService();
    
    console.log('\n💰 Testing DigiFlazz balance...');
    const balance = await digiflazz.checkBalance();
    console.log('✅ Balance:', balance.deposit);
    
    console.log('\n📦 Testing DigiFlazz products...');
    const products = await digiflazz.getPriceList();
    console.log('✅ Products:', products.length);
    
    // Show sample products
    console.log('\n🔍 Sample Products:');
    products.slice(0, 3).forEach(p => {
      console.log(`   ${p.buyer_sku_code}: ${p.product_name} - Rp ${p.price}`);
    });
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
};

test();
