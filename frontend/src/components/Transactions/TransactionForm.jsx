import { useState, useContext, useEffect } from "react";
import { DollarSign, Tag, FileText, Calendar, Wallet, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

function TransactionForm({ wallets, budgets = [], onAdd }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    walletId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateAiDescription = () => {
    if (!formData.category || !formData.amount) return;
    
    setAiLoading(true);
    
    // Simulate AI description generation
    setTimeout(() => {
      const descriptions = {
        'Food': [`Meal at restaurant $${formData.amount}`, `Grocery shopping for essentials`, `Coffee and snacks purchase`, `Lunch with colleagues today`],
        'Transportation': [`Gas station fill-up $${formData.amount}`, `Public transport monthly pass`, `Taxi ride to destination`, `Car maintenance and service`],
        'Entertainment': [`Movie tickets and popcorn`, `Concert tickets for tonight`, `Gaming subscription renewal`, `Books and magazines purchase`],
        'Shopping': [`Clothing and accessories purchase`, `Electronics and gadgets buy`, `Home improvement items`, `Personal care products`],
        'Bills': [`Monthly utility bill payment`, `Internet and phone service`, `Insurance premium payment`, `Subscription service renewal`],
        'Healthcare': [`Doctor visit and consultation`, `Pharmacy medication purchase`, `Dental checkup and cleaning`, `Health insurance copay`],
        'Salary': [`Monthly salary deposit received`, `Bonus payment from employer`, `Overtime compensation earned`, `Performance incentive payment`],
        'Freelance': [`Client project payment received`, `Consulting work compensation`, `Design work payment`, `Writing assignment fee`],
        'Investment': [`Dividend payment received today`, `Stock sale profit`, `Bond interest payment`, `Mutual fund returns`],
        'Gift': [`Birthday gift money received`, `Holiday cash gift`, `Wedding gift from family`, `Graduation money gift`],
        'Other': [`Miscellaneous transaction for $${formData.amount}`, `General expense payment`, `Uncategorized financial activity`, `Other income or expense`]
      };
      
      const categoryDescriptions = descriptions[formData.category] || descriptions['Other'];
      const randomDescription = categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
      
      // Limit to 10 words
      const words = randomDescription.split(' ');
      const limitedDescription = words.slice(0, 10).join(' ');
      
      setFormData(prev => ({ ...prev, description: limitedDescription }));
      setAiLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (formData.category && formData.amount && !formData.description) {
      generateAiDescription();
    }
  }, [formData.category, formData.amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await api.post("/api/transactions", formData);
      onAdd(res.data);
      setFormData({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        walletId: "",
      });
      setSuccess("Transaction added successfully!");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  const budgetCategories = budgets.map(b => b.category);
  const defaultCategories = {
    expense: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'],
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
  };
  
  const categories = {
    expense: [...new Set([...budgetCategories, ...defaultCategories.expense])],
    income: defaultCategories.income
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Add Transaction</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-400">{success}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: "expense" })}
            className={`p-3 rounded-lg border-2 transition-colors ${
              formData.type === "expense"
                ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-300"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: "income" })}
            className={`p-3 rounded-lg border-2 transition-colors ${
              formData.type === "income"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-300"
            }`}
          >
            Income
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
            {formData.type === 'expense' && budgetCategories.length > 0 && (
              <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                (Select budget category to track spending)
              </span>
            )}
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              required
            >
              <option value="">Select category</option>
              {categories[formData.type].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (optional)
            </label>
            <button
              type="button"
              onClick={generateAiDescription}
              disabled={!formData.category || !formData.amount || aiLoading}
              className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              <span>AI Generate</span>
            </button>
          </div>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors resize-none"
              placeholder="Add a note about this transaction..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            />
          </div>
        </div>

        {wallets.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Wallet
            </label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="walletId"
                value={formData.walletId}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              >
                <option value="">Personal</option>
                {wallets.map((wallet) => (
                  <option key={wallet._id} value={wallet._id}>
                    {wallet.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Adding...</span>
            </>
          ) : (
            <span>Add Transaction</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
