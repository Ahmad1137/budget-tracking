import { useState, useContext, useEffect, useCallback } from "react";
import { DollarSign, Tag, FileText, Calendar, Wallet, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { validateWorkflow, getWorkflowMessages } from "../../utils/validations";
import { generateTransactionDescription } from "../../services/geminiService";

function TransactionForm({ wallets = [], budgets = [], onAdd, transactions = [] }) {
  const { } = useContext(AuthContext);
  const { isDark } = useTheme();
  const toast = useToast();
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

  const generateAiDescription = useCallback(async () => {
    if (!formData.category || !formData.amount) return;
    
    setAiLoading(true);
    
    try {
      const description = await generateTransactionDescription(
        formData.type,
        formData.category,
        formData.amount
      );
      setFormData(prev => ({ ...prev, description }));
    } catch (error) {
      console.error('Failed to generate AI description:', error);
    } finally {
      setAiLoading(false);
    }
  }, [formData.type, formData.category, formData.amount]);

  useEffect(() => {
    if (formData.category && formData.amount && !formData.description) {
      generateAiDescription();
    }
  }, [formData.category, formData.amount, formData.description, generateAiDescription]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Validate workflow requirements
      if (!validateWorkflow.hasWallets(wallets)) {
        const msg = getWorkflowMessages.noWallets;
        toast.error(msg.title, msg.message);
        setLoading(false);
        return;
      }

      if (!formData.walletId) {
        toast.error("Select Wallet", "Please select a wallet for this transaction.");
        setLoading(false);
        return;
      }

      // Validate minimum amount
      const amountCheck = validateWorkflow.checkMinimumAmount(parseFloat(formData.amount), formData.type);
      if (!amountCheck.valid) {
        const msg = getWorkflowMessages.minimumAmount(formData.type);
        toast.error(msg.title, msg.message);
        setLoading(false);
        return;
      }

      // Check for duplicate transactions
      const duplicateCheck = validateWorkflow.checkDuplicateTransaction(
        { ...formData, amount: parseFloat(formData.amount) },
        transactions
      );
      if (duplicateCheck.warning) {
        const msg = getWorkflowMessages.duplicateWarning;
        toast.warning(msg.title, msg.message);
      }

      // For expense transactions, validate budget and balance
      if (formData.type === 'expense') {
        // First check if wallet has any funds
        const walletTransactions = transactions.filter(t => t.walletId === formData.walletId);
        const currentBalance = validateWorkflow.getWalletBalance(formData.walletId, walletTransactions);
        
        if (currentBalance <= 0) {
          const msg = getWorkflowMessages.noFunds;
          toast.error(msg.title, msg.message);
          setLoading(false);
          return;
        }

        // Check wallet balance
        const balanceCheck = validateWorkflow.checkWalletBalance(
          { ...formData, amount: parseFloat(formData.amount), walletId: formData.walletId },
          walletTransactions
        );

        if (!balanceCheck.valid) {
          if (balanceCheck.noFunds) {
            const msg = getWorkflowMessages.noFunds;
            toast.error(msg.title, msg.message);
          } else if (balanceCheck.insufficientFunds) {
            const msg = getWorkflowMessages.insufficientFunds(
              currentBalance.toFixed(2),
              formData.amount,
              balanceCheck.shortfall.toFixed(2)
            );
            toast.error(msg.title, msg.message);
          }
          setLoading(false);
          return;
        }

        if (balanceCheck.warning) {
          const percentage = Math.round((parseFloat(formData.amount) / currentBalance) * 100);
          const remaining = (currentBalance - parseFloat(formData.amount)).toFixed(2);
          const msg = getWorkflowMessages.balanceWarning(percentage, remaining);
          toast.warning(msg.title, msg.message);
        }

        // Check budget limits
        const budgetCheck = validateWorkflow.checkBudgetLimit(
          { ...formData, amount: parseFloat(formData.amount) },
          budgets,
          transactions
        );

        if (!budgetCheck.valid) {
          if (budgetCheck.noBudget) {
            const msg = getWorkflowMessages.noBudgets;
            toast.warning(msg.title, msg.message);
            // Allow transaction to continue but warn user
          } else if (budgetCheck.budgetExceeded) {
            const msg = getWorkflowMessages.budgetExceeded(
              formData.category,
              budgetCheck.remainingBudget.toFixed(2),
              formData.amount
            );
            toast.error(msg.title, msg.message);
            setLoading(false);
            return;
          }
        }

        if (budgetCheck.warning) {
          const categoryBudget = budgets.find(b => 
            b.category.toLowerCase() === formData.category.toLowerCase() &&
            b.walletId === formData.walletId
          );
          const newTotal = budgetCheck.currentSpent + parseFloat(formData.amount);
          const percentage = Math.round((newTotal / categoryBudget.amount) * 100);
          const remaining = (categoryBudget.amount - newTotal).toFixed(2);
          const msg = getWorkflowMessages.budgetWarning(formData.category, percentage, remaining);
          toast.warning(msg.title, msg.message);
        }
      }

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
      
      // Show appropriate success message
      if (formData.type === 'income') {
        const msg = getWorkflowMessages.workflowSuccess.income;
        toast.success(msg.title, msg.message);
      } else {
        const msg = getWorkflowMessages.workflowSuccess.transaction;
        toast.success(msg.title, msg.message);
      }
      setSuccess("Transaction added successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to add transaction";
      setError(errorMsg);
      toast.error("Transaction Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Filter budget categories based on selected wallet
  const walletBudgetCategories = budgets ? 
    budgets
      .filter(b => !formData.walletId || b.walletId === formData.walletId)
      .map(b => b.category) : [];
  
  const defaultCategories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
  };
  
  const categories = {
    expense: walletBudgetCategories.length > 0 ? [...new Set([...walletBudgetCategories])] : [],
    income: defaultCategories.income
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
      <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Add Transaction</h2>
      
      {error && (
        <div className={`mb-4 p-4 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg flex items-center space-x-2`}>
          <AlertCircle className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          <span className={`${isDark ? 'text-red-400' : 'text-red-700'}`}>{error}</span>
        </div>
      )}
      
      {success && (
        <div className={`mb-4 p-4 ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border rounded-lg flex items-center space-x-2`}>
          <CheckCircle className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          <span className={`${isDark ? 'text-green-400' : 'text-green-700'}`}>{success}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: "expense" })}
            className={`p-3 rounded-lg border-2 transition-colors ${
              formData.type === "expense"
                ? `border-red-500 ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700'}`
                : `${isDark ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'} hover:border-red-300`
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: "income" })}
            className={`p-3 rounded-lg border-2 transition-colors ${
              formData.type === "income"
                ? `border-green-500 ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700'}`
                : `${isDark ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'} hover:border-green-300`
            }`}
          >
            Income
          </button>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
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
              className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              placeholder="0.00"
              required
            />
          </div>
        </div>
  <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Wallet {!validateWorkflow.hasWallets(wallets) && (
              <span className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'} ml-2`}>
                (Create a wallet first)
              </span>
            )}
          </label>
          <div className="relative">
            <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              name="walletId"
              value={formData.walletId}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              required
            >
              <option value="">Select Wallet</option>
              {wallets && wallets.map((wallet) => (
                <option key={wallet._id} value={wallet._id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </div>
          {!validateWorkflow.hasWallets(wallets) && (
            <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'} mt-1`}>
              You need to create at least one wallet before adding transactions.
            </p>
          )}
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Category
            {formData.type === 'expense' && (
              <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'} ml-2`}>
                {formData.walletId ? 
                  (walletBudgetCategories.length > 0 ? 
                    `(${walletBudgetCategories.length} budget categories available)` : 
                    '(No budgets for this wallet - create budgets first)'
                  ) : 
                  '(Select wallet first)'
                }
              </span>
            )}
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              required
            >
              <option value="">Select category</option>
              {formData.type === 'expense' && !formData.walletId ? (
                <option disabled>Select wallet first</option>
              ) : (
                categories[formData.type].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              )}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Description (optional)
            </label>
            <button
              type="button"
              onClick={generateAiDescription}
              disabled={!formData.category || !formData.amount || aiLoading}
              className={`flex items-center space-x-1 text-xs ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
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
              className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none`}
              placeholder="Add a note about this transaction..."
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            />
          </div>
        </div>

      

        <button
          type="submit"
          disabled={loading || !validateWorkflow.hasWallets(wallets)}
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
