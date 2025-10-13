const digiflazz = require('./digiflazz');

async function testSKU() {
    console.log('🧪 Testing Custom SKUs...');
    
    // Test SKU custom Telkomsel 5.000
    const testSKU = 'Tkl5';
    const testPhone = '081287923785'; // Ganti dengan nomor Anda
    
    console.log(`Testing SKU: ${testSKU} for ${testPhone}`);
    
    const result = await digiflazz.purchase(testSKU, testPhone);
    
    if (result.success) {
        console.log('✅ SUCCESS! Custom SKU works!');
        console.log('Transaction details:');
        console.log('- Ref ID:', result.refId);
        console.log('- SN:', result.data.sn);
        console.log('- Status:', result.data.status);
        console.log('- Message:', result.data.message);
    } else {
        console.log('❌ FAILED:');
        console.log('Error:', result.error);
        console.log('Tips: Pastikan SKU sudah benar dan saldo cukup');
    }
}

testSKU();
