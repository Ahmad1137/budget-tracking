const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const { body, validationResult } = require("express-validator");

// Create or Update Budget
const setBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { category, amount, year, month, walletId } = req.body;
  try {
    let budget = await Budget.findOne({
      userId: req.user.id,
      category,
      year,
      month,
      walletId: walletId || null,
    });

    if (budget) {
      // Update existing budget
      budget.amount = amount;
      await budget.save();
      return res.json(budget);
    }

    // Create new budget
    budget = new Budget({
      userId: req.user.id,
      category,
      amount,
      year,
      month,
      walletId: walletId || null,
    });
    await budget.save();
    res.json(budget);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// Get Budgets with Spending
const getBudgets = async (req, res) => {
  const { year, month, walletId } = req.query;
  try {
    let query = { userId: req.user.id };
    if (year) query.year = year;
    if (month) query.month = month;
    if (walletId) query.walletId = walletId || null;

    const budgets = await Budget.find(query);

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(budget.year, budget.month - 1, 1);
        const endDate = new Date(budget.year, budget.month, 0); // Last day of month

        let transactionQuery = {
          userId: req.user.id,
          category: budget.category,
          type: "expense",
          date: { $gte: startDate, $lte: endDate },
        };
        if (budget.walletId) transactionQuery.walletId = budget.walletId;

        const transactions = await Transaction.find(transactionQuery);
        const spent = transactions.reduce((sum, t) => sum + t.amount, 0);

        return {
          ...budget._doc,
          spent,
          remaining: budget.amount - spent,
          overBudget: spent > budget.amount,
        };
      })
    );

    res.json(budgetsWithSpending);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// Delete Budget
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({ msg: "Budget not found" });
    }
    
    // Check if user owns the budget
    if (budget.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ msg: "Budget deleted successfully" });
  } catch (err) {
    console.error("Delete budget error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { setBudget, getBudgets, deleteBudget };
