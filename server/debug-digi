// debug-digiflazz.js
require('dotenv').config();

console.log('🔐 DEBUG DIGIFLAZZ CREDENTIALS\n');

// Tampilkan sebagian credentials untuk verifikasi
const username = process.env.DIGIFLAZZ_USERNAME;
const apiKey = process.env.DIGIFLAZZ_API_KEY;

console.log('📋 CREDENTIALS VERIFICATION:');
console.log('   Username:', username);
console.log('   Username length:', username?.length);
console.log('   API Key prefix:', apiKey ? apiKey.substring(0, 8) + '...' : 'undefined');
console.log('   API Key length:', apiKey?.length);

console.log('\n💡 COMMON MISTAKES:');
console.log('   ❌ Using login username (should be API username)');
console.log('   ❌ Using password (should be API key)');
console.log('   ❌ Wrong copy-paste (extra spaces)');
console.log('   ❌ Account not activated for API');

console.log('\n🎯 SOLUTION:');
console.log('   1. Go to DigiFlazz → API menu');
console.log('   2. Copy EXACT username and API key shown there');
console.log('   3. Update .env file');
console.log('   4. Restart test');

// Test format credentials
if (username && apiKey) {
  console.log('\n🔍 CREDENTIALS FORMAT ANALYSIS:');
  
  if (username.includes(' ')) {
    console.log('   ⚠️  Username contains spaces (might be wrong)');
  }
  
  if (apiKey.length < 10) {
    console.log('   ⚠️  API Key too short (should be long string)');
  }
  
  if (username === 'your_digiflazz_username' || apiKey === 'your_digiflazz_api_key') {
    console.log('   ❌ Still using placeholder values!');
  }
}
