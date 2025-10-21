const BotProductService = require('./services/BotProductService');

async function debugProducts() {
    try {
        console.log("🔍 DEBUG: Memeriksa karakter produk...\n");

        // Ambil semua produk pulsa
        const allProducts = await BotProductService.getPulsaProducts();
        console.log(`📱 Total produk: ${allProducts.length}`);

        // Fungsi untuk debug markdown
        function debugMarkdown(text) {
            if (typeof text !== 'string') return 'NOT_A_STRING';
            
            const problematicChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
            let foundChars = [];
            
            problematicChars.forEach(char => {
                if (text.includes(char)) {
                    foundChars.push(char);
                }
            });
            
            if (foundChars.length > 0) {
                console.log(`⚠️  Karakter bermasalah: [${foundChars.join(', ')}] dalam teks: "${text}"`);
            }
            
            return foundChars;
        }

        console.log("\n🔍 MEMERIKSA PRODUK AXIS:");
        const axisProducts = allProducts.filter(p => p.operator && p.operator.toLowerCase() === 'axis');
        axisProducts.forEach((product, index) => {
            console.log(`\n${index + 1}. Produk: ${product.name}`);
            console.log(`   Kode: ${product.code}`);
            const issuesName = debugMarkdown(product.name);
            const issuesCode = debugMarkdown(product.code);
            
            if (issuesName.length > 0 || issuesCode.length > 0) {
                console.log(`   ❌ MASALAH: Nama=${issuesName.length}, Kode=${issuesCode.length}`);
            }
        });

        console.log("\n🔍 MEMERIKSA PRODUK INDOSAT:");
        const indosatProducts = allProducts.filter(p => p.operator && p.operator.toLowerCase() === 'indosat');
        indosatProducts.forEach((product, index) => {
            console.log(`\n${index + 1}. Produk: ${product.name}`);
            console.log(`   Kode: ${product.code}`);
            const issuesName = debugMarkdown(product.name);
            const issuesCode = debugMarkdown(product.code);
            
            if (issuesName.length > 0 || issuesCode.length > 0) {
                console.log(`   ❌ MASALAM: Nama=${issuesName.length}, Kode=${issuesCode.length}`);
            }
        });

        console.log("\n🔍 SUMMARY:");
        console.log(`Total produk: ${allProducts.length}`);
        console.log(`Produk Axis: ${axisProducts.length}`);
        console.log(`Produk Indosat: ${indosatProducts.length}`);

    } catch (error) {
        console.error('❌ Error dalam debug:', error);
    }
}

// Jalankan debug
debugProducts();
