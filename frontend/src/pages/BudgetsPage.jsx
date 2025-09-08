import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";
import BudgetForm from "../components/Budgets/BudgetForm";
import BudgetList from "../components/Budgets/BudgetList";


function BudgetsPage() {
  const { isDark } = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [filteredBudgets, setFilteredBudgets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState({
    year: 'all',
    month: 'all',
  });
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    fetchData();
    // Load AI suggestion from localStorage
    const savedSuggestion = localStorage.getItem('budgetAiSuggestion');
    if (savedSuggestion) {
      setAiSuggestion(savedSuggestion);
    }
  }, []);

  useEffect(() => {
    filterBudgets();
  }, [budgets, searchTerm, filterStatus, selectedPeriod]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgetsRes, walletsRes] = await Promise.all([
        api.get("/api/budgets"),
        api.get("/api/wallets"),
      ]);
      setBudgets(budgetsRes.data);
      setWallets(walletsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterBudgets = () => {
    let filtered = budgets.filter((budget) =>
      budget.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by year
    if (selectedPeriod.year !== 'all') {
      filtered = filtered.filter((budget) => budget.year === selectedPeriod.year);
    }

    // Filter by month
    if (selectedPeriod.month !== 'all') {
      filtered = filtered.filter((budget) => budget.month === selectedPeriod.month);
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((budget) => {
        if (filterStatus === "over") return budget.overBudget;
        if (filterStatus === "warning")
          return !budget.overBudget && budget.spent / budget.amount > 0.8;
        if (filterStatus === "good")
          return !budget.overBudget && budget.spent / budget.amount <= 0.8;
        return true;
      });
    }

    setFilteredBudgets(filtered);
  };

  const handleAdd = (budget) => {
    setBudgets([budget, ...budgets]);
    setShowForm(false);
  };

  const getBudgetStats = () => {
    const total = budgets.length;
    const overBudget = budgets.filter((b) => b.overBudget).length;
    const warning = budgets.filter(
      (b) => !b.overBudget && b.spent / b.amount > 0.8
    ).length;
    const good = total - overBudget - warning;
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

    return { total, overBudget, warning, good, totalBudget, totalSpent };
  };

  const stats = getBudgetStats();

  const fetchAiSuggestion = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      // Simulate AI suggestion since backend endpoint doesn't exist
      const suggestions = [
        "Consider reducing your dining out budget by 15% and allocating those funds to your savings goal.",
        "Your entertainment spending is 20% over budget. Try setting weekly limits to stay on track.",
        "Great job staying under budget! Consider increasing your emergency fund allocation by $100.",
        "Your grocery budget has room for optimization. Meal planning could save you $50-80 monthly.",
        "Transportation costs are high this month. Consider carpooling or public transit to reduce expenses."
      ];
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      
      // Clear previous suggestion and set new one
      localStorage.removeItem('budgetAiSuggestion');
      localStorage.setItem('budgetAiSuggestion', randomSuggestion);
      setAiSuggestion(randomSuggestion);
    } catch (err) {
      setAiError("Failed to get AI suggestion");
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto mt-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-14 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Budget Management
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {selectedPeriod.year === 'all' && selectedPeriod.month === 'all' 
              ? 'All Time Budgets'
              : selectedPeriod.year === 'all'
              ? 'All Years'
              : selectedPeriod.month === 'all'
              ? `All Months ${selectedPeriod.year}`
              : new Date(
                  selectedPeriod.year,
                  selectedPeriod.month - 1
                ).toLocaleDateString("en-US", { month: "long", year: "numeric" })
            }
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Budget</span>
          </button>
          <button
            onClick={fetchAiSuggestion}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            disabled={aiLoading}
          >
            {aiLoading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <span>Get AI Advice</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Budgets
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.total}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Over Budget
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.overBudget}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Budget
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${stats.totalBudget}
              </p>
            </div>
            <div className="text-green-500 text-sm">Budget</div>
          </div>
        </div>
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Spent
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${stats.totalSpent}
              </p>
            </div>
            <div className="text-blue-500 text-sm">Spent</div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl border mb-6`}>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Filter & Search Budgets</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Year Filter */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Year
            </label>
            <select
              value={selectedPeriod.year === 'all' ? 'all' : selectedPeriod.year}
              onChange={(e) =>
                setSelectedPeriod({
                  ...selectedPeriod,
                  year: e.target.value === 'all' ? 'all' : parseInt(e.target.value),
                })
              }
              className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="all">All Years</option>
              {[2023, 2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Month
            </label>
            <select
              value={selectedPeriod.month === 'all' ? 'all' : selectedPeriod.month}
              onChange={(e) =>
                setSelectedPeriod({
                  ...selectedPeriod,
                  month: e.target.value === 'all' ? 'all' : parseInt(e.target.value),
                })
              }
              className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="all">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2024, month - 1).toLocaleDateString("en-US", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Status
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="all">All Budgets</option>
                <option value="good">On Track</option>
                <option value="warning">Near Limit (80%+)</option>
                <option value="over">Over Budget</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Form */}
      {showForm && (
        <div className="mb-8">
          <BudgetForm
            wallets={wallets}
            onAdd={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}



      {/* Budget List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
          <BudgetList budgets={filteredBudgets} onUpdate={fetchData} />
        </div>
       
      </div>

      {/* AI Suggestion Card */}
      <div className={`mt-8 p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border`}>
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
          AI Budget Suggestions
        </h3>
        <button
          onClick={fetchAiSuggestion}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors mb-4"
          disabled={aiLoading}
        >
          {aiLoading ? (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <span>Get AI Advice</span>
        </button>
        {aiError && <p className="text-red-500 text-sm mb-2">{aiError}</p>}
        {aiSuggestion && (
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
            {aiSuggestion}
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetsPage;
