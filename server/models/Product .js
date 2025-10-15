const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['pulsa', 'paket-data', 'ewallet', 'pln', 'game-voucher', 'custom'],
    index: true
  },
  type: {
    type: String,
    enum: ['digiflazz', 'custom'],
    default: 'digiflazz'
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  markup: {
    type: Number,
    default: 10,
    min: [0, 'Markup cannot be negative']
  },
  finalPrice: {
    type: Number,
    required: true
  },
  supplier: {
    type: String,
    enum: ['digiflazz', 'custom'],
    required: true
  },
  sku: {
    type: String,
    sparse: true
  },
  stock: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  description: {
    type: String
  },
  commissionRate: {
    type: Number,
    default: 5
  },
  createdBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

// Auto-calculate final price before saving
productSchema.pre('save', function(next) {
  this.finalPrice = Math.round(this.basePrice * (1 + (this.markup / 100)));
  next();
});

// Index for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);