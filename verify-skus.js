const digiflazz = require('./digiflazz');

async function verifySKUs() {
    console.log('🔍 Verifying Custom SKUs...');
    
    const skusToVerify = [
        'Tkl5', 'Tkl10', 'Tkl25', 'Tkl50', 'Tkl100',
        'IND5', 'IND10', 'IND25', 'IND50', 'IND100', 
        'X5', 'X10', 'X25', 'X50', 'X100',
        'Ax5', 'Ax10', 'Ax25', 'Ax50', 'Ax100'
    ];
    
    const prices = await digiflazz.getPriceList();
    
    if (prices.success) {
        console.log('✅ Price list loaded, verifying SKUs...\n');
        
        skusToVerify.forEach(sku => {
            const product = prices.data.find(p => p.buyer_sku_code === sku);
            if (product) {
                console.log(`✅ ${sku}: ${product.product_name} - Rp ${product.price}`);
            } else {
                console.log(`❌ ${sku}: NOT FOUND in Digiflazz`);
            }
        });
        
        console.log('\n💡 Jika ada SKU yang ❌, pastikan sudah dibuat di dashboard Digiflazz');
    } else {
        console.log('❌ Failed to load price list:', prices.error);
    }
}

verifySKUs();
