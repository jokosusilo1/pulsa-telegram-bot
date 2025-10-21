const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  operator: String,
  base_price: { type: Number, required: true },
  selling_price: { type: Number, required: true },
  profit: { type: Number, required: true },
  status: { type: String, default: 'active' },
  digiflazz_data: { type: Object } // Untuk menyimpan data original
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
