const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Pulsa', 'Data', 'PLN', 'Voucher', 'Game'],
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    stock: {
        type: Number,
        default: 999
    },
    isActive: {
        type: Boolean,
        default: true
    },
    provider: {
        type: String,
        trim: true
    },
    denomination: {
        type: String,
        trim: true
    },
    validity: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index untuk pencarian
productSchema.index({ code: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);