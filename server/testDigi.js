// server/testDigi.js
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

console.log('🚀 STARTING DIGIFLAZZ TEST...\n');

// Cek environment variables
console.log('🔍 ENVIRONMENT CHECK:');
console.log('   DIGIFLAZZ_USERNAME:', process.env.DIGIFLAZZ_USERNAME ? '***SET***' : '❌ NOT SET');
console.log('   DIGIFLAZZ_API_KEY:', process.env.DIGIFLAZZ_API_KEY ? '***SET***' : '❌ NOT SET');

if (!process.env.DIGIFLAZZ_USERNAME || !process.env.DIGIFLAZZ_API_KEY) {
  console.log('\n❌ ERROR: Environment variables not set!');
  console.log('💡 Add to .env file:');
  console.log('   DIGIFLAZZ_USERNAME=your_username');
  console.log('   DIGIFLAZZ_API_KEY=your_api_key');
  process.exit(1);
}

const testDigiFlazz = async () => {
  try {
    const username = process.env.DIGIFLAZZ_USERNAME;
    const apiKey = process.env.DIGIFLAZZ_API_KEY;
    
    console.log('\n🔑 GENERATING SIGNATURE...');
    const signature = crypto.createHash('md5')
      .update(username + apiKey + 'deposit')
      .digest('hex');
    
    console.log('   Signature:', signature.substring(0, 10) + '...');

    console.log('\n🌐 DETECTING SERVER IP...');
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json', { timeout: 5000 });
      console.log('   Your Server IP:', ipResponse.data.ip);
    } catch (ipError) {
      console.log('   ❌ Could not detect IP');
    }

    console.log('\n💰 CHECKING DIGIFLAZZ BALANCE...');
    console.log('   Sending request to DigiFlazz...');
    
    const response = await axios.post('https://api.digiflazz.com/v1/cek-saldo', {
      username: username,
      sign: signature
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PPOB-API-Test/1.0.0'
      }
    });

    console.log('\n✅ SUCCESS! DigiFlazz Response:');
    console.log('   Status:', response.data.rc);
    console.log('   Message:', response.data.message);
    console.log('   Deposit: Rp', response.data.data?.deposit?.toLocaleString() || '0');
    
    if (response.data.rc === '00') {
      console.log('\n🎉 DIGIFLAZZ CONNECTION SUCCESSFUL!');
    } else {
      console.log('\n⚠️  DigiFlazz returned error:', response.data.message);
    }

  } catch (error) {
    console.log('\n❌ TEST FAILED:');
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Error Code:', error.response.data?.rc);
      console.log('   Message:', error.response.data?.message);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('   No response received from DigiFlazz');
      console.log('   Timeout or network issue');
    } else {
      console.log('   Error:', error.message);
    }
    
    // Specific error handling
    if (error.response?.data?.message?.includes('Gagal memproses API Buyer')) {
      console.log('\n🔒 IP WHITELIST ISSUE:');
      console.log('   Your IP needs to be whitelisted in DigiFlazz');
      console.log('   Go to: DigiFlazz → API → IP Whitelist');
      console.log('   Add your server IP address');
    }
  }
};

// Run the test
testDigiFlazz();
