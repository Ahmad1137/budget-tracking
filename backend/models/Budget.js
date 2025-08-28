const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" }, // Optional for shared wallets
    category: { type: String, required: true }, // e.g., 'Food', 'Transport'
    amount: { type: Number, required: true }, // Budget limit
    period: { type: String, default: "month" }, // For simplicity, assume monthly
    year: { type: Number, required: true }, // e.g., 2025
    month: { type: Number, required: true }, // 1-12
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);
