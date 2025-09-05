import { useEffect, useState, useContext } from "react";
import { useTheme } from "../context/ThemeContext";
import { Plus, Users, Wallet, DollarSign, TrendingUp, Search, Filter, MoreVertical, Edit, Trash2, UserPlus, Copy, Check, AlertCircle } from "lucide-react";
import api from "../utils/api";
import WalletForm from "../components/Wallets/WalletForm";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getWorkflowMessages, validateWorkflow } from "../utils/validations";

function WalletsPage() {
  const { user } = useContext(AuthContext);
  const { isDark } = useTheme();
  const toast = useToast();
  const [wallets, setWallets] = useState([]);
  const [filteredWallets, setFilteredWallets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [joinId, setJoinId] = useState("");
  const [joinError, setJoinError] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [walletStats, setWalletStats] = useState({});
  const [showIncomePrompt, setShowIncomePrompt] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    filterWallets();
  }, [wallets, searchTerm, filterType]);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const [walletsRes, transactionsRes] = await Promise.all([
        api.get("/api/wallets"),
        api.get("/api/transactions")
      ]);
      
      setWallets(walletsRes.data);
      setTransactions(transactionsRes.data);
      
      // Calculate stats for each wallet
      const stats = {};
      walletsRes.data.forEach(wallet => {
        const walletTransactions = transactionsRes.data.filter(t => t.walletId === wallet._id);
        const totalIncome = walletTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = walletTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpenses;
        
        stats[wallet._id] = {
          balance,
          totalTransactions: walletTransactions.length,
          monthlyTransactions: walletTransactions.filter(t => {
            const transactionDate = new Date(t.date);
            const now = new Date();
            return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
          }).length
        };
      });
      
      setWalletStats(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterWallets = () => {
    let filtered = wallets.filter(wallet => 
      wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType !== "all") {
      filtered = filtered.filter(wallet => {
        if (filterType === "owned") return wallet.ownerId === user?._id;
        if (filterType === "shared") return wallet.ownerId !== user?._id;
        return true;
      });
    }

    setFilteredWallets(filtered);
  };

  const handleAdd = (wallet) => {
    setWallets([wallet, ...wallets]);
    setShowForm(false);
    const msg = getWorkflowMessages.workflowSuccess.wallet;
    toast.success(msg.title, msg.message);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError("");
    try {
      const res = await api.post(`/api/wallets/${joinId}/join`);
      setWallets([res.data, ...wallets]);
      setJoinId("");
      setShowJoinForm(false);
      toast.success("Wallet Joined", `Successfully joined wallet: ${res.data.name}`);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to join wallet";
      setJoinError(errorMsg);
      toast.error("Join Failed", errorMsg);
    }
  };

  const copyWalletId = async (walletId) => {
    try {
      await navigator.clipboard.writeText(walletId);
      setCopiedId(walletId);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Copied!", "Wallet ID copied to clipboard");
    } catch (err) {
      toast.error("Copy Failed", "Failed to copy wallet ID to clipboard");
      console.error('Failed to copy wallet ID');
    }
  };

  const handleAddIncome = (wallet) => {
    setSelectedWallet(wallet);
    setShowIncomePrompt(true);
  };

  const handleIncomeAdded = (transaction) => {
    setTransactions([transaction, ...transactions]);
    fetchWallets(); // Refresh wallet stats
    setShowIncomePrompt(false);
  };

  const deleteWallet = async (walletId) => {
    if (window.confirm('Are you sure you want to delete this wallet?')) {
      try {
        await api.delete(`/api/wallets/${walletId}`);
        setWallets(wallets.filter(w => w._id !== walletId));
        toast.success("Wallet Deleted", "Wallet has been successfully deleted.");
      } catch (err) {
        const errorMsg = err.response?.data?.msg || 'Failed to delete wallet';
        toast.error("Delete Failed", errorMsg);
        console.error('Failed to delete wallet:', err);
      }
    }
  };

  const getTotalStats = () => {
    const totalBalance = Object.values(walletStats).reduce((sum, stats) => sum + stats.balance, 0);
    const totalTransactions = Object.values(walletStats).reduce((sum, stats) => sum + stats.totalTransactions, 0);
    return { totalBalance, totalTransactions };
  };

  const { totalBalance, totalTransactions } = getTotalStats();

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
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Wallet Management</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage your personal and shared wallets</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowJoinForm(!showJoinForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Join Wallet</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Wallet</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Wallets</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{wallets.length}</p>
            </div>
            <Wallet className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Balance</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${totalBalance.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Transactions</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalTransactions}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Empty Wallets Alert */}
      {wallets.length > 0 && Object.values(walletStats).every(stat => stat.balance <= 0) && (
        <div className={`mb-6 p-4 ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border rounded-xl`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`h-5 w-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'} mt-0.5`} />
            <div className="flex-1">
              <h3 className={`font-semibold ${isDark ? 'text-yellow-100' : 'text-yellow-900'}`}>Add Income to Get Started</h3>
              <p className={`${isDark ? 'text-yellow-200' : 'text-yellow-800'} text-sm mt-1`}>
                Your wallets are empty! Add some income first before creating budgets or tracking expenses.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Join Wallet Form */}
      {showJoinForm && (
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl border mb-6`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Join Existing Wallet</h3>
          <p className={`${isDark ? 'text-gray-500' : 'text-gray-900'} mb-3`}>Copy wallet id below to join the wallet</p>
          <form onSubmit={handleJoin} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                className={`w-full px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter wallet ID to join"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Join
            </button>
            <button
              type="button"
              onClick={() => setShowJoinForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </form>
          {joinError && <p className="text-red-500 text-sm mt-2">{joinError}</p>}
        </div>
      )}

      {/* Wallet Form */}
      {showForm && (
        <div className="mb-8">
          <WalletForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Search and Filter */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-xl border mb-6`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search wallets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="all">All Wallets</option>
              <option value="owned">Owned by Me</option>
              <option value="shared">Shared with Me</option>
            </select>
          </div>
        </div>
      </div>

      {/* Wallets Grid */}
      {filteredWallets.length === 0 ? (
        <div className="text-center py-12">
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Wallet className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No wallets found</h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Create your first wallet or join an existing one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWallets.map((wallet) => {
            const stats = walletStats[wallet._id] || { balance: 0, totalTransactions: 0, monthlyTransactions: 0 };
            const isOwner = wallet.ownerId === user?._id;
            
            return (
              <div
                key={wallet._id}
                className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isOwner ? (isDark ? "bg-blue-900/20" : "bg-blue-100") : (isDark ? "bg-green-900/20" : "bg-green-100")
                    }`}>
                      <Wallet className={`h-5 w-5 ${
                        isOwner ? (isDark ? "text-blue-400" : "text-blue-600") : (isDark ? "text-green-400" : "text-green-600")
                      }`} />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{wallet.name}</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {isOwner ? "Owner" : "Member"}
                      </p>
                    </div>
                  </div>
                  
                  
                  {isOwner && (
                    <div className="flex space-x-2">
                     
                      <button 
                        onClick={() => deleteWallet(wallet._id)}
                        className={`${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-4`}>
                  {wallet.description || "No description"}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Balance</p>
                    <p className={`font-semibold ${
                      stats.balance >= 0 
                        ? (isDark ? "text-green-400" : "text-green-600")
                        : (isDark ? "text-red-400" : "text-red-600")
                    }`}>${stats.balance.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Transactions</p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalTransactions}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {wallet.members?.length || 0} members
                    </span>
                  </div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stats.monthlyTransactions} this month
                  </span>
                </div>
                
                <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyWalletId(wallet._id)}
                      className={`text-xs ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} flex items-center space-x-1`}
                    >
                      {copiedId === wallet._id ? (
                        <><Check className="h-3 w-3" /><span>Copied!</span></>
                      ) : (
                        <><Copy className="h-3 w-3" /><span>Copy ID</span></>
                      )}
                    </button>
                  </div>
                  {stats.balance <= 0 && (
                    <button
                      onClick={() => handleAddIncome(wallet)}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
                    >
                      Add Income
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Income Prompt Modal */}
      {showIncomePrompt && selectedWallet && (
        <IncomePrompt 
          wallet={selectedWallet}
          onIncomeAdded={handleIncomeAdded}
          onClose={() => setShowIncomePrompt(false)}
        />
      )}
    </div>
  );
}

export default WalletsPage;
