const mongoose = require('mongoose');

// Budget Schema
const budgetSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Add userId field
    category: { type: String, required: true }, // Add category field
    limit: { type: Number, required: true },    // Add limit field
});


module.exports = mongoose.model('Budget', budgetSchema);
