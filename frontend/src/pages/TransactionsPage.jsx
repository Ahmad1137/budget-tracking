import { useEffect, useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import api from "../utils/api";
import TransactionForm from "../components/Transactions/TransactionForm";
import TransactionList from "../components/Transactions/TransactionList";

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transRes, walletsRes] = await Promise.all([
          api.get("/api/transactions"),
          api.get("/api/wallets"),
        ]);
        setTransactions(transRes.data);
        setWallets(walletsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAdd = (transaction) => {
    setTransactions([transaction, ...transactions]);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter((t) => t._id !== id));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your income and expenses</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {showForm && (
          <div className="lg:col-span-1">
            <TransactionForm wallets={wallets} onAdd={handleAdd} />
          </div>
        )}
        
        <div className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Recent Transactions ({transactions.length})
            </h3>
            <TransactionList transactions={transactions} onDelete={handleDelete} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;
