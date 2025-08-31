const { GoogleGenerativeAI } = require("@google/generative-ai");
const Transaction = require("../models/Transaction");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Get AI Budget Suggestion
const getBudgetSuggestion = async (req, res) => {
  try {
    // Fetch user's recent transactions
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(50); // Limit to recent 50 for performance

    // Summarize transactions for AI prompt
    const transactionSummary = transactions
      .map(
        (t) =>
          `${t.date.toISOString().split("T")[0]}: ${t.type} - $${t.amount} on ${
            t.category
          } (${t.description || "No desc"})`
      )
      .join("\n");

    // AI Prompt: Generate budget suggestions
    const prompt = `
      You are a financial advisor. Based on the following transaction history, suggest a monthly budget breakdown by category (e.g., Food: $200, Transport: $100). Also, provide 2-3 tips to save money. Keep response concise (under 200 words) and don't write bold.

      Transactions:
      ${transactionSummary || "No recent transactions."}
    `;

    const result = await model.generateContent(prompt);
    const suggestion = result.response.text();

    res.json({ suggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to generate AI suggestion" });
  }
};

module.exports = { getBudgetSuggestion };
