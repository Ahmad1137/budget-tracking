import { useState } from "react";
import { DollarSign, Tag, Calendar, Wallet, AlertCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { validateWorkflow, getWorkflowMessages } from "../../utils/validations";

function BudgetForm({ wallets, budget, onAdd, onCancel }) {
  const { isDark } = useTheme();
  const toast = useToast();
  const [formData, setFormData] = useState({
    category: budget?.category || "",
    amount: budget?.amount || "",
    year: budget?.year || new Date().getFullYear(),
    month: budget?.month || new Date().getMonth() + 1,
    walletId: budget?.walletId || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Validate workflow requirements
      if (!validateWorkflow.hasWallets(wallets)) {
        const msg = getWorkflowMessages.noWallets;
        toast.error(msg.title, msg.message);
        setLoading(false);
        return;
      }

      if (!formData.walletId) {
        toast.error("Select Wallet", "Please select a wallet for this budget.");
        setLoading(false);
        return;
      }

      // Validate minimum amount
      const amountCheck = validateWorkflow.checkMinimumAmount(parseFloat(formData.amount), 'budget');
      if (!amountCheck.valid) {
        toast.error("Invalid Amount", amountCheck.message);
        setLoading(false);
        return;
      }

      // Validate budget period
      const periodCheck = validateWorkflow.checkBudgetPeriod(formData);
      if (!periodCheck.valid) {
        toast.error("Invalid Period", periodCheck.message);
        setLoading(false);
        return;
      }
      if (periodCheck.warning) {
        toast.warning("Future Budget", periodCheck.message);
      }

      // Get all transactions to check wallet balance
      const transactionsRes = await api.get("/api/transactions");
      const allTransactions = transactionsRes.data || [];

      // Check if wallet has sufficient funds for budget
      const affordabilityCheck = validateWorkflow.checkBudgetAffordability(
        { amount: parseFloat(formData.amount) },
        formData.walletId,
        allTransactions
      );

      if (!affordabilityCheck.valid) {
        if (affordabilityCheck.noFunds) {
          const msg = getWorkflowMessages.noFunds;
          toast.error(msg.title, msg.message);
        } else if (affordabilityCheck.exceedsBalance) {
          const walletBalance = validateWorkflow.getWalletBalance(formData.walletId, allTransactions);
          const msg = getWorkflowMessages.budgetExceedsBalance(formData.amount, walletBalance.toFixed(2));
          toast.error(msg.title, msg.message);
        }
        setLoading(false);
        return;
      }

      if (affordabilityCheck.warning) {
        toast.warning("High Budget Amount", affordabilityCheck.message);
      }

      // Check total budget limits (only for new budgets)
      if (!budget) {
        const budgetsRes = await api.get("/api/budgets");
        const existingBudgets = budgetsRes.data || [];
        
        const totalBudgetCheck = validateWorkflow.checkTotalBudgetLimit(
          { amount: parseFloat(formData.amount) },
          existingBudgets,
          formData.walletId,
          allTransactions
        );

        if (!totalBudgetCheck.valid) {
          const walletBalance = validateWorkflow.getWalletBalance(formData.walletId, allTransactions);
          const totalExisting = existingBudgets
            .filter(b => b.walletId === formData.walletId)
            .reduce((sum, b) => sum + b.amount, 0);
          const newTotal = totalExisting + parseFloat(formData.amount);
          const msg = getWorkflowMessages.totalBudgetExceeds(newTotal.toFixed(2), walletBalance.toFixed(2));
          toast.error(msg.title, msg.message);
          setLoading(false);
          return;
        }

        if (totalBudgetCheck.warning) {
          toast.warning("High Total Budgets", totalBudgetCheck.message);
        }
      }

      let res;
      if (budget) {
        res = await api.put(`/api/budgets/${budget._id}`, formData);
      } else {
        res = await api.post("/api/budgets", formData);
      }
      
      onAdd(res.data);
      
      const msg = getWorkflowMessages.workflowSuccess.budget;
      toast.success(msg.title, msg.message);
      
      if (!budget) {
        setFormData({
          category: "",
          amount: "",
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          walletId: "",
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || `Failed to ${budget ? 'update' : 'set'} budget`;
      setError(errorMsg);
      toast.error("Budget Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
      <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>{budget ? 'Edit Budget' : 'Create Budget'}</h2>
      
      {error && (
        <div className={`mb-4 p-4 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg flex items-center space-x-2`}>
          <AlertCircle className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          <span className={`${isDark ? 'text-red-400' : 'text-red-700'}`}>{error}</span>
        </div>
      )}
      
      {!validateWorkflow.hasWallets(wallets) && (
        <div className={`mb-4 p-4 ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border rounded-lg`}>
          <p className={`${isDark ? 'text-yellow-200' : 'text-yellow-800'} text-sm`}>
            You need to create at least one wallet before setting up budgets.
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Category</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              placeholder="e.g., Food, Transportation, Entertainment"
              required
            />
          </div>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Budget Amount</label>
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
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Year</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                required
              >
                {[2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Month</label>
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              required
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
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
        </div>
        
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading || !validateWorkflow.hasWallets(wallets)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>{budget ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{budget ? 'Update Budget' : 'Create Budget'}</span>
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default BudgetForm;
