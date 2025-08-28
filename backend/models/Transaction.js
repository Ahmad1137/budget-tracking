const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" }, // Optional for personal, required for shared
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true }, // e.g., 'food', 'salary'
    date: { type: Date, default: Date.now },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
