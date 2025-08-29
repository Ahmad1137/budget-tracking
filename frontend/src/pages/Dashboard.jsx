import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import TransactionChart from "../components/Transactions/TransactionChart";
import BudgetChart from "../components/Budgets/BudgetChart";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/transactions/charts?period=month");
        const income = res.data.find((d) => d._id.type === "income")?.total || 0;
        const expense = res.data.find((d) => d._id.type === "expense")?.total || 0;
        setStats({ totalIncome: income, totalExpense: expense });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const balance = stats.totalIncome - stats.totalExpense;
  const isPositive = balance >= 0;

  const statCards = [
    {
      title: "Total Income",
      value: stats.totalIncome,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      trend: "+12%",
      trendIcon: ArrowUpRight
    },
    {
      title: "Total Expenses",
      value: stats.totalExpense,
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      trend: "+8%",
      trendIcon: ArrowUpRight
    },
    {
      title: "Balance",
      value: balance,
      icon: DollarSign,
      color: isPositive ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400",
      bgColor: isPositive ? "bg-blue-50 dark:bg-blue-900/20" : "bg-red-50 dark:bg-red-900/20",
      trend: isPositive ? "+5%" : "-3%",
      trendIcon: isPositive ? ArrowUpRight : ArrowDownRight
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your financial overview for this month
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendIcon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${stat.color}`}>
                  <TrendIcon className="h-4 w-4" />
                  <span>{stat.trend}</span>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${Math.abs(stat.value).toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <TransactionChart />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <BudgetChart />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/transactions')}
            className="flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Transaction</span>
          </button>
          <button 
            onClick={() => navigate('/wallets')}
            className="flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Wallet className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Create Wallet</span>
          </button>
          <button 
            onClick={() => navigate('/budgets')}
            className="flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Set Budget</span>
          </button>
          <button 
            onClick={() => navigate('/reports')}
            className="flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <DollarSign className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
