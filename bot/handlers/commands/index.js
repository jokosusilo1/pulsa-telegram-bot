const start = require('./start');
const products = require('./products');
const balance = require('./balance');
const help = require('./help');
const profile = require('./profile');
const purchase = require('./purchase');
// const deposit = require('./deposit'); // Comment dulu jika belum ada

function register(bot) {
    // Text commands
    bot.onText(/\/start/, (msg) => start(bot, msg));
    bot.onText(/\/products/, (msg) => products(bot, msg));
    bot.onText(/\/balance/, (msg) => balance(bot, msg));
    bot.onText(/\/help/, (msg) => help(bot, msg));
    
    // Menu commands
    bot.onText(/📊 CEK HARGA/, (msg) => products(bot, msg));
    bot.onText(/💳 CEK SALDO/, (msg) => balance(bot, msg));
    bot.onText(/🛒 BELI PULSA/, (msg) => purchase.startPurchase(bot, msg));
    bot.onText(/👤 PROFIL/, (msg) => profile(bot, msg));
    bot.onText(/❓ BANTUAN/, (msg) => help(bot, msg));
    // bot.onText(/💰 DEPOSIT/, (msg) => deposit(bot, msg)); // Comment dulu
}

module.exports = { register };
