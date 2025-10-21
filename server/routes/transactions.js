// routes/transactions.js
const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/TransactionController');

const transactionController = new TransactionController();

// POST /api/transactions/purchase - Proses pembelian
router.post('/purchase', (req, res) => transactionController.purchase(req, res));

// GET /api/transactions/:transaction_id - Cek status
router.get('/:transaction_id', (req, res) => transactionController.checkStatus(req, res));

// GET /api/transactions - Riwayat transaksi
router.get('/', (req, res) => transactionController.getHistory(req, res));

module.exports = router;
