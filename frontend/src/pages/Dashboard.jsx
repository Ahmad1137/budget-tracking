import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Plus, ArrowUpRight, ArrowDownRight, HelpCircle, AlertCircle } from "lucide-react";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { validateWorkflow } from "../utils/validations";
import IncomeExpenseChart from "../components/Charts/IncomeExpenseChart";
import MonthlyTransactionChart from "../components/Charts/MonthlyTransactionChart";
import WorkflowGuide from "../components/WorkflowGuide";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0 });
  const [wallets, setWallets] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, walletsRes, budgetsRes] = await Promise.all([
          api.get("/api/transactions"),
          api.get("/api/wallets"),
          api.get("/api/budgets")
        ]);
        
        const transactionsData = transactionsRes.data || [];
        const walletsData = walletsRes.data || [];
        const budgetsData = budgetsRes.data || [];
        
        setTransactions(transactionsData);
        setWallets(walletsData);
        setBudgets(budgetsData);
        
        const totalIncome = transactionsData.filter(t => t?.type === 'income').reduce((sum, t) => sum + (t?.amount || 0), 0);
        const totalExpense = transactionsData.filter(t => t?.type === 'expense').reduce((sum, t) => sum + (t?.amount || 0), 0);
        setStats({ totalIncome, totalExpense });
        
        // Show workflow guide for new users
        if (!validateWorkflow.hasWallets(walletsData) && !localStorage.getItem('workflowGuideShown')) {
          setShowWorkflowGuide(true);
          localStorage.setItem('workflowGuideShown', 'true');
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setStats({ totalIncome: 0, totalExpense: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const balance = stats.totalIncome - stats.totalExpense;
  const isPositive = balance >= 0;

  const statCards = [
    {
      title: "Total Income",
      value: stats.totalIncome,
      icon: TrendingUp,
      color: isDark ? "text-green-400" : "text-green-600",
      bgColor: isDark ? "bg-green-900/20" : "bg-green-50",
      trend: "+12%",
      trendIcon: ArrowUpRight
    },
    {
      title: "Total Expenses",
      value: stats.totalExpense,
      icon: TrendingDown,
      color: isDark ? "text-red-400" : "text-red-600",
      bgColor: isDark ? "bg-red-900/20" : "bg-red-50",
      trend: "+8%",
      trendIcon: ArrowUpRight
    },
    {
      title: "Balance",
      value: balance,
      icon: DollarSign,
      color: isPositive ? (isDark ? "text-blue-400" : "text-blue-600") : (isDark ? "text-red-400" : "text-red-600"),
      bgColor: isPositive ? (isDark ? "bg-blue-900/20" : "bg-blue-50") : (isDark ? "bg-red-900/20" : "bg-red-50"),
      trend: isPositive ? "+5%" : "-3%",
      trendIcon: isPositive ? ArrowUpRight : ArrowDownRight
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className={`h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-48 mb-8`}></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-2xl`}></div>
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Here's your financial overview for this month
            </p>
          </div>
          <button
            onClick={() => setShowWorkflowGuide(true)}
            className={`flex items-center space-x-2 px-4 py-2 ${isDark ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} rounded-lg transition-colors`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>How it works</span>
          </button>
        </div>
      </div>

      {/* Getting Started Alert */}
      {!validateWorkflow.hasWallets(wallets) && (
        <div className={`mb-8 p-4 ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-xl`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'} mt-0.5`} />
            <div className="flex-1">
              <h3 className={`font-semibold ${isDark ? 'text-blue-100' : 'text-blue-900'}`}>Get Started with Budget Tracking</h3>
              <p className={`${isDark ? 'text-blue-200' : 'text-blue-800'} text-sm mt-1`}>
                Create your first wallet to start tracking your finances. Then set up budgets and add transactions.
              </p>
              <div className="flex space-x-3 mt-3">
                <button
                  onClick={() => navigate('/wallets')}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
                >
                  Create Wallet
                </button>
                <button
                  onClick={() => setShowWorkflowGuide(true)}
                  className={`text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  Learn How
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendIcon;
          return (
            <div key={index} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border card-hover`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${stat.color}`}>
                  <TrendIcon className="h-4 w-4" />
                  <span>{stat.trend}</span>
                </div>
              </div>
              <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                {stat.title}
              </h3>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${Math.abs(stat.value).toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Income vs Expenses</h3>
          <IncomeExpenseChart/>
        </div>
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Monthly Balance</h3>
          <MonthlyTransactionChart />
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border`}>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/transactions')}
            className={`flex flex-col items-center p-4 rounded-xl border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
          >
            <Plus className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-2`} />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Transaction</span>
          </button>
          <button 
            onClick={() => navigate('/wallets')}
            className={`flex flex-col items-center p-4 rounded-xl border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
          >
            <Wallet className={`h-8 w-8 ${isDark ? 'text-green-400' : 'text-green-600'} mb-2`} />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Wallet</span>
          </button>
          <button 
            onClick={() => navigate('/budgets')}
            className={`flex flex-col items-center p-4 rounded-xl border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
          >
            <TrendingUp className={`h-8 w-8 ${isDark ? 'text-purple-400' : 'text-purple-600'} mb-2`} />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Set Budget</span>
          </button>
          <button 
            onClick={() => navigate('/reports')}
            className={`flex flex-col items-center p-4 rounded-xl border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
          >
            <DollarSign className={`h-8 w-8 ${isDark ? 'text-orange-400' : 'text-orange-600'} mb-2`} />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>View Reports</span>
          </button>
        </div>
      </div>
      
      {/* Workflow Guide Modal */}
      {showWorkflowGuide && (
        <WorkflowGuide onClose={() => setShowWorkflowGuide(false)} />
      )}
    </div>
  );
}

export default Dashboard;
