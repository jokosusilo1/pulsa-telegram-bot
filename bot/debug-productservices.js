const path = require('path');
const fs = require('fs');

// Coba berbagai path possibilities
const pathsToTry = [
    path.join(__dirname, '..', '..', 'server', 'services', 'BotProductService'),
    path.join(__dirname, '..', '..', '..', 'server', 'services', 'BotProductService'),
    path.join(__dirname, '..', 'server', 'services', 'BotProductService'),
    '../../server/services/BotProductService',
    '../../../server/services/BotProductService',
    '../server/services/BotProductService'
];

let BotProductService;
let loadedPath = '';

for (const modulePath of pathsToTry) {
    try {
        const fullPath = modulePath.includes('.js') ? modulePath : modulePath + '.js';
        if (fs.existsSync(fullPath) || fs.existsSync(modulePath)) {
            BotProductService = require(modulePath);
            loadedPath = modulePath;
            console.log("✅ BotProductService loaded from:", modulePath);
            break;
        }
    } catch (e) {
        // Continue to next path
        console.log("❌ Failed to load from:", modulePath);
    }
}

if (!BotProductService) {
    console.log("❌ Cannot load BotProductService, using mock");
    // Fallback to mock
    BotProductService = {
        getPulsaProducts: async () => {
            return [
                { code: "AX5", name: "Axis 5K", price: 6000, operator: "AXIS" },
                { code: "AX10", name: "Axis 10K", price: 11000, operator: "AXIS" }
            ];
        }
    };
}

module.exports = (bot) => {
    // Your existing pulsa command code...
    bot.onText(/\/pulsa/, async (msg) => {
        // Your implementation
    });
};
