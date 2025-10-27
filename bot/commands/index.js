const start = require('./start');
const registrationModule = require('./registration');
const products = require('./products');
const profile = require('./profile');
const balance = require('./balance');
const help = require('./help');
const transaction = require('./transaction');
const deposit = require('./deposit');
const order = require('./order');
const report = require('./report');
const pin = require('./pin');

function loadCommands(bot) {
    console.log('🔄 Loading all commands...');
    
    // Load start command
    start(bot);
    
    // Load registration module - gunakan setupRegistration
    if (registrationModule && typeof registrationModule.setupRegistration === 'function') {
        console.log('✅ Setting up registration system...');
        registrationModule.setupRegistration(bot);
    } else {
        console.log('❌ Registration setup function not found');
    }
    
    // Load other commands
    products(bot);
    profile(bot);
    balance(bot);
    help(bot);
    transaction(bot);
    deposit(bot);
    order(bot);
    report(bot);
    pin(bot);
    
    console.log('✅ All commands loaded successfully!');
}

module.exports = loadCommands;