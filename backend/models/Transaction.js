// models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;
