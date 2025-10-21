// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // ID unik untuk tracking
  transaction_id: {
    type: String,
    required: true,
    unique: true
  },
  
  // Info produk
  product_code: {
    type: String,
    required: true
  },
  product_name: {
    type: String,
    required: true
  },
  
  // Info customer
  customer_number: {
    type: String,
    required: true
  },
  agent_id: {
    type: String,
    required: true
  },
  
  // Pricing
  base_price: {
    type: Number,
    required: true
  },
  selling_price: {
    type: Number,
    required: true
  },
  profit: {
    type: Number,
    required: true
  },
  
  // Status transaksi
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'processing'],
    default: 'pending'
  },
  
  // Response dari DigiFlazz
  provider_response: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Timestamps
  completed_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Static methods
transactionSchema.statics.generateTransactionId = function() {
  return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

transactionSchema.statics.findByAgent = function(agentId) {
  return this.find({ agent_id: agentId }).sort({ created_at: -1 });
};

module.exports = mongoose.model('Transaction', transactionSchema);
