import { useEffect, useState } from "react";
import { Search, Filter, Plus, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import api from "../utils/api";
import BudgetForm from "../components/Budgets/BudgetForm";
import BudgetList from "../components/Budgets/BudgetList";
import BudgetChart from "../components/Budgets/BudgetChart";

function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [filteredBudgets, setFilteredBudgets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  useEffect(() => {
    filterBudgets();
  }, [budgets, searchTerm, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgetsRes, walletsRes] = await Promise.all([
        api.get(`/api/budgets?year=${selectedPeriod.year}&month=${selectedPeriod.month}`),
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
    let filtered = budgets.filter(budget => 
      budget.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus !== "all") {
      filtered = filtered.filter(budget => {
        if (filterStatus === "over") return budget.overBudget;
        if (filterStatus === "warning") return !budget.overBudget && (budget.spent / budget.amount) > 0.8;
        if (filterStatus === "good") return !budget.overBudget && (budget.spent / budget.amount) <= 0.8;
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
    const overBudget = budgets.filter(b => b.overBudget).length;
    const warning = budgets.filter(b => !b.overBudget && (b.spent / b.amount) > 0.8).length;
    const good = total - overBudget - warning;
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    
    return { total, overBudget, warning, good, totalBudget, totalSpent };
  };

  const stats = getBudgetStats();

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Budget Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date(selectedPeriod.year, selectedPeriod.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Budget</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Budgets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Over Budget</p>
              <p className="text-2xl font-bold text-red-600">{stats.overBudget}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalBudget}</p>
            </div>
            <div className="text-green-500 text-sm">Budget</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalSpent}</p>
            </div>
            <div className="text-blue-500 text-sm">Spent</div>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
            <select
              value={selectedPeriod.year}
              onChange={(e) => setSelectedPeriod({...selectedPeriod, year: parseInt(e.target.value)})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
            <select
              value={selectedPeriod.month}
              onChange={(e) => setSelectedPeriod({...selectedPeriod, month: parseInt(e.target.value)})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Budget Form */}
      {showForm && (
        <div className="mb-8">
          <BudgetForm wallets={wallets} onAdd={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search budgets by category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Budgets</option>
              <option value="good">On Track</option>
              <option value="warning">Near Limit</option>
              <option value="over">Over Budget</option>
            </select>
          </div>
        </div>
      </div>

      {/* Budget List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BudgetList budgets={filteredBudgets} onUpdate={fetchData} />
        </div>
        <div className="lg:col-span-1">
          <BudgetChart budgets={budgets} />
        </div>
      </div>
    </div>
  );
}

export default BudgetsPage;
