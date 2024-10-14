const express = require('express');
const RegularExpense = require('../models/RegularExpense');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const expenses = await RegularExpense.find({ userId: req.user._id });
        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving regular expenses' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, amount, type, category } = req.body;
        const newExpense = new RegularExpense({
            userId: req.user._id, 
            name,
            amount,
            type,
            category
        });

        await newExpense.save();
        res.status(201).json({ message: 'Regular expense added successfully', expense: newExpense });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: 'Error adding regular expense' });
    }
});

module.exports = router;
