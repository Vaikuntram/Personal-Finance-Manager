// index.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Budget = require('./models/Budget');
const bcrypt = require('bcrypt');
const RegularExpense = require('./models/RegularExpense');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: {type: String, unique: true, sparse: true},
});
const User = mongoose.model('User', UserSchema);

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

/*
const BudgetSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true },
});
const Budget = mongoose.model('Budget', BudgetSchema);
*/
// API Routes

app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Username, password, and email are required.' });
    }

    try {
        // Check for existing user
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'User registration failed', error: error.message });
    }
});


// User Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password }); // Use hashed password check in production
        if (user) {
            res.json({ userId: user._id });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error });
    }
});

// Add Transaction
app.post('/api/transactions', async (req, res) => {
    const { userId, category, amount } = req.body;
    try {
        const transaction = new Transaction({ userId, category, amount });
        await transaction.save();

        const budget = await Budget.findOne({ userId, category });
        if(budget){
            budget.limit -= amount;
            await budget.save();
        }

        res.status(201).json({ message: 'Transaction added', transaction });
    } catch (error) {
        res.status(400).json({ message: 'Error adding transaction', error });
    }
});

// Get Transactions
app.get('/api/transactions', async (req, res) => {
    const { userId } = req.query;
    try {
        const transactions = await Transaction.find({ userId });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
});

app.post('/api/budgets', async (req, res) => {
    const { userId, category, limit } = req.body;
    try {
        const budget = new Budget({ userId, category, limit });
        await budget.save();
        res.status(201).json({ message: 'Budget added', budget });
    } catch (error) {
        res.status(400).json({ message: 'Error adding budget', error });
    }
});

app.get('/api/budgets', async (req, res) => {
    const { userId } = req.query; // Get userId from query parameters
    console.log('Fetching budgets for userId:', userId); // This should log in the console when this route is hit
    try {
        const budgets = await Budget.find({ userId }); // Ensure to filter budgets by userId
        const transactions = await Transaction.find({ userId: req.user.id });

        res.json(budgets);
    } catch (error) {
        console.error('Error fetching budgets:', error); // Log the error
        res.status(500).json({ message: 'Error fetching budgets', error });
    }
});


app.post('/api/regular-expenses', async (req, res) => {
    try {
        const { userId, name, amount, type, category } = req.body;

        // Validate the input data
        if (!userId || !name || !amount || !type || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        console.log('Adding expense:', { userId, name, amount, type, category }); // Log the received data
        const expense = new RegularExpense({ userId, name, amount, type, category });
        await expense.save();
        res.status(201).json({ message: 'Regular expense added successfully', expense });
    } catch (error) {
        console.error('Error adding expense:', error); // Log the error
        res.status(500).json({ message: 'Error adding expense', error }); // Send 500 error if unexpected
    }
});

app.get('/api/regular-expenses', async (req, res) => {
    const { userId } = req.query;
    try {
        const rex = await RegularExpense.find({ userId }); // Ensure to filter by userId
        res.json(rex);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching regular expenses', error});
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
