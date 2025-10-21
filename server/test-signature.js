// test-signature-fix.js
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');


console.log('🎯 TESTING FIXED SIGNATURE\n');

const testAllSignatures = async () => {
  const username = process.env.DIGIFLAZZ_USERNAME;
  const apiKey = process.env.DIGIFLAZZ_API_KEY;

  console.log('🔑 TESTING DIFFERENT SIGNATURE METHODS:');

  // Test 1: Balance dengan 'depo'
  console.log('\n1. Testing balance with "depo":');
  try {
    const signature1 = crypto.createHash('md5')
      .update(username + apiKey + 'depo')
      .digest('hex');

    const response1 = await axios.post('https://api.digiflazz.com/v1/cek-saldo', {
      username: username,
      sign: signature1
    });

    console.log('   ✅ SUCCESS with "depo"');
    console.log('   Balance:', response1.data.data.deposit);
  } catch (error) {
    console.log('   ❌ FAILED with "depo":', error.response?.data?.message);
  }

  // Test 2: Balance dengan 'deposit' 
  console.log('\n2. Testing balance with "deposit":');
  try {
    const signature2 = crypto.createHash('md5')
      .update(username + apiKey + 'deposit')
      .digest('hex');

    const response2 = await axios.post('https://api.digiflazz.com/v1/cek-saldo', {
      username: username,
      sign: signature2
    });

    console.log('   ✅ SUCCESS with "deposit"');
    console.log('   Balance:', response2.data.data.deposit);
  } catch (error) {
    console.log('   ❌ FAILED with "deposit":', error.response?.data?.message);
  }

  // Test 3: Products dengan 'pricelist'
  console.log('\n3. Testing products with "pricelist":');
  try {
    const signature3 = crypto.createHash('md5')
      .update(username + apiKey + 'pricelist')
      .digest('hex');

    const response3 = await axios.post('https://api.digiflazz.com/v1/price-list', {
      cmd: 'prepaid',
      username: username,
      sign: signature3
    });

    console.log('   ✅ SUCCESS with "pricelist"');
    console.log('   Products:', response3.data.data.length);
  } catch (error) {
    console.log('   ❌ FAILED with "pricelist":', error.response?.data?.message);
  }
};

testAllSignatures();
