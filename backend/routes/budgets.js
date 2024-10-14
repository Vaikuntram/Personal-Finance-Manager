const express = require('express');
const Budget = require('../models/Budget');
const router = express.Router();

// Create Budget
router.post('/', async (req, res) => {
    const { userId, category, limit } = req.body;

    if (!userId || !category || !limit) {
        return res.status(400).json({ message: 'User ID, category, and limit are required.' });
    }

    try {
        const newBudget = new Budget({ userId, category, limit });
        await newBudget.save();
        res.status(201).json({ message: 'Budget created successfully!' });
    } catch (error) {
        console.error('Budget error:', error);
        res.status(500).json({ message: 'Error creating budget.' });
    }
});

// Get Budgets for User
router.get('/', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }
    try {
        const budgets = await Budget.find({ userId });
        res.status(200).json(budgets);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ message: 'Error fetching budgets.' });
    }
});

// Export the router
module.exports = router;
