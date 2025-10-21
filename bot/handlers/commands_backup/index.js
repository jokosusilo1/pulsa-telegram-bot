const start = require('./start');
const help = require('./help');
const products = require('./products');
const purchase = require('./purchase');
const balance = require('./balance');
const deposit = require('./deposit');
const profile = require('./profile');

// ✅ EKSPOR FUNCTION, BUKAN OBJECT
module.exports = (bot) => {
    start(bot);
    help(bot);
    products(bot);
    purchase(bot);
    balance(bot);
    deposit(bot);
    profile(bot);
    
    console.log("✅ Command handlers registered: start, help, products, purchase, balance, deposit, profile");
};
