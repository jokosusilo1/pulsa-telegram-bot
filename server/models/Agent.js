// server/models/Agent.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const agentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true, // Tambahkan required untuk registrasi
        trim: true
    },
    telegramId: {
        type: String,
        unique: true,
        sparse: true
    },
    pin: {
        type: String,
        required: true // Tambahkan field PIN
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isRegistered: {
        type: Boolean,
        default: false // Tambahkan status registrasi
    },
    registrationStep: {
        type: String,
        default: 'phone' // Tambahkan step registrasi
    },
    role: {
        type: String,
        default: 'agent',
        enum: ['user', 'agent', 'admin']
    }
}, {
    timestamps: true
});

// Hash PIN sebelum menyimpan
agentSchema.pre('save', async function(next) {
    if (this.isModified('pin')) {
        try {
            const saltRounds = 10;
            this.pin = await bcrypt.hash(this.pin, saltRounds);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Method untuk verifikasi PIN
agentSchema.methods.verifyPin = async function(candidatePin) {
    try {
        return await bcrypt.compare(candidatePin, this.pin);
    } catch (error) {
        console.error('Error verifying PIN:', error);
        return false;
    }
};

// Index untuk pencarian
agentSchema.index({ phone: 1 });
agentSchema.index({ telegramId: 1 });
agentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Agent', agentSchema);