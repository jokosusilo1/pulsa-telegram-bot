// models/Agent.js
const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  telegram_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String
  },
  phone: {
    type: String
  },
  // Balance information
  balance: {
    type: Number,
    default: 0
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true
  },
  // Statistics
  statistics: {
    total_transactions: { type: Number, default: 0 },
    total_profit: { type: Number, default: 0 },
    successful_transactions: { type: Number, default: 0 },
    failed_transactions: { type: Number, default: 0 }
  },
  // Settings
  settings: {
    auto_topup: { type: Boolean, default: false },
    low_balance_alert: { type: Number, default: 10000 }
  }
}, {
  timestamps: true
});

// Instance methods
agentSchema.methods.updateStatistics = function(transaction) {
  this.statistics.total_transactions += 1;
  
  if (transaction.status === 'success') {
    this.statistics.successful_transactions += 1;
    this.statistics.total_profit += transaction.profit;
  } else if (transaction.status === 'failed') {
    this.statistics.failed_transactions += 1;
  }
  
  return this.save();
};

agentSchema.methods.hasSufficientBalance = function(amount) {
  return this.balance >= amount;
};

agentSchema.methods.deductBalance = function(amount) {
  this.balance -= amount;
  return this.save();
};

agentSchema.methods.addBalance = function(amount) {
  this.balance += amount;
  return this.save();
};

module.exports = mongoose.model('Agent', agentSchema);