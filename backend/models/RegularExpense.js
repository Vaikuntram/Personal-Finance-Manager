
const mongoose = require('mongoose');

const RegularExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  category: { type: String, required: true },
});

module.exports = mongoose.model('RegularExpense', RegularExpenseSchema);
