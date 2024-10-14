// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// POST: Add a new transaction
router.post('/', async (req, res) => {
    const { userId, category, amount } = req.body;

    if (!userId || !category || !amount) {
        return res.status(400).json({ message: 'User ID, category, and amount are required.' });
    }

    try {
        const newTransaction = new Transaction({ userId, category, amount });
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(500).json({ message: 'Error adding transaction', error });
    }
});

router.get('/', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
        const transactions = await Transaction.find({ userId });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
});

module.exports = router;
