const OrderCallbacks = require('./orderCallbacks');

module.exports = (bot) => {
    OrderCallbacks.register(bot);
    console.log("✅ Callback handlers registered: order, balance");
};
