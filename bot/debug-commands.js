const fs = require('fs');
const path = require('path');

console.log("🔍 DEBUG: Checking each command file for syntax errors...\n");

const commands = [
    'start.js', 'products.js', 'pulsa.js', 'order.js', 'balance.js'
];

commands.forEach(file => {
    const filePath = path.join(__dirname, 'commands', file);
    console.log(`📁 Checking: ${file}`);
    
    try {
        // Baca file sebagai text dulu
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Cari karakter mencurigakan
        if (content.includes('?.') || content.includes('??')) {
            console.log(`   ⚠️  Found optional chaining in: ${file}`);
        }
        
        // Coba require file
        delete require.cache[require.resolve(filePath)];
        const module = require(filePath);
        
        if (typeof module === 'function') {
            console.log(`   ✅ ${file} - Syntax OK, exports function`);
        } else {
            console.log(`   ⚠️  ${file} - Exports: ${typeof module}`);
        }
        
    } catch (error) {
        console.log(`   ❌ ${file} - ERROR: ${error.message}`);
        
        // Tampilkan line error jika ada
        if (error.stack) {
            const lines = error.stack.split('\n');
            if (lines.length > 1) {
                console.log(`   📍 ${lines[1].trim()}`);
            }
        }
    }
    console.log('');
});

console.log("🎯 DEBUG COMPLETED");
