// server/models/Operator.js
const mongoose = require('mongoose');

const operatorSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['pulsa', 'data', 'pln', 'game'],
    default: 'pulsa'
  },
  category: {
    type: String,
    enum: ['telkomsel', 'indosat', 'xl', 'axis', 'three', 'smartfren', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  icon: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index untuk pencarian
operatorSchema.index({ code: 1, type: 1, status: 1 });

module.exports = mongoose.model('Operator', operatorSchema);

