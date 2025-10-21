// test-db.js - FIXED VERSION
require('dotenv').config(); // ⭐⭐⭐ LOAD ENV FIRST ⭐⭐⭐

console.log('🔍 ENV CHECK:');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '***SET***' : '❌ NOT SET');

const mongoose = require('mongoose');

const testDB = async () => {
  try {
    // ⭐⭐⭐ HARCODE MONGODB_URI JIKA MASIH ERROR ⭐⭐⭐
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ppob';
    
    console.log('🔗 Connecting to:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Database connected');
    
    // Test Product model
    const Product = require('./server/models/Product');
    const count = await Product.countDocuments();
    console.log(`📦 Existing products: ${count}`);
    
    if (count === 0) {
      console.log('💡 No products yet. Need to sync from DigiFlazz.');
    }
    
  } catch (error) {
    console.log('❌ DB error:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

testDB();
