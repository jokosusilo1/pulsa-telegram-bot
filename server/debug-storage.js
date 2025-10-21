// PASTIKAN PATH BENAR - adjust berdasarkan lokasi file
const StorageService = require('./services/StorageService');

async function testStorage() {
    console.log('🧪 Testing StorageService...');
    
    try {
        // Test 1: Cek apakah StorageService ada methodnya
        console.log('📋 StorageService methods:', Object.keys(StorageService));
        
        // Test 2: Test getProducts
        console.log('1. Testing getProducts...');
        const products = await StorageService.getProducts();
        console.log(`✅ Got ${products.length} products`);
        
        // Test 3: Test saveProducts
        console.log('2. Testing saveProducts...');
        const testProducts = [
            {
                code: "test1",
                name: "Test Product 1", 
                price: 10000,
                commission: 500,
                category: "pulsa",
                operator: "TEST",
                status: "active"
            }
        ];
        
        const result = await StorageService.saveProducts(testProducts);
        console.log(`✅ Saved ${result.count} products`);
        
        // Test 4: Test getProducts lagi
        console.log('3. Testing getProducts again...');
        const products2 = await StorageService.getProducts();
        console.log(`✅ Now have ${products2.length} products`);
        
        console.log('🎉 ALL TESTS PASSED!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testStorage();