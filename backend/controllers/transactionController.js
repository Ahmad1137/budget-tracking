const Transaction = require("../models/Transaction");
const { body, validationResult } = require("express-validator");

// Add Transaction
const addTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const newTransaction = new Transaction({
      ...req.body,
      userId: req.user.id, // From JWT
    });
    const transaction = await newTransaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// Get Transactions (with filters)
const getTransactions = async (req, res) => {
  const { walletId, startDate, endDate, category } = req.query;
  let query = { userId: req.user.id };
  if (walletId) query.walletId = walletId;
  if (startDate) query.date = { ...query.date, $gte: new Date(startDate) };
  if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };
  if (category) query.category = category;

  try {
    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// Update Transaction
const updateTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction)
      return res.status(404).json({ msg: "Transaction not found" });
    if (transaction.userId.toString() !== req.user.id)
      return res.status(401).json({ msg: "Unauthorized" });

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(transaction);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// Delete Transaction
const deleteTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction)
      return res.status(404).json({ msg: "Transaction not found" });
    if (transaction.userId.toString() !== req.user.id)
      return res.status(401).json({ msg: "Unauthorized" });

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ msg: "Transaction removed" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const getChartData = async (req, res) => {
  const { walletId, period } = req.query; // period: 'month', 'year'
  let groupBy = { $month: "$date" }; // Default monthly
  if (period === "year") groupBy = { $year: "$date" };

  let match = { userId: req.user.id };
  if (walletId) match.walletId = walletId;

  try {
    const data = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { type: "$type", period: groupBy },
          total: { $sum: "$amount" },
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getChartData,
};
