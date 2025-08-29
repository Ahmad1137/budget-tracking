import { Trash2, Calendar, Tag, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import api from "../../utils/api";

function TransactionList({ transactions, onDelete }) {
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/transactions/${id}`);
      onDelete(id);
    } catch (err) {
      console.error(err);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Start by adding your first transaction</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const isIncome = transaction.type === "income";
        const Icon = isIncome ? TrendingUp : TrendingDown;
        
        return (
          <div
            key={transaction._id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 card-hover"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  isIncome 
                    ? "bg-green-100 dark:bg-green-900/20" 
                    : "bg-red-100 dark:bg-red-900/20"
                }`}>
                  <Icon className={`h-5 w-5 ${
                    isIncome 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {transaction.description || transaction.category}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Tag className="h-4 w-4" />
                      <span>{transaction.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                    {transaction.walletId && (
                      <div className="flex items-center space-x-1">
                        <Wallet className="h-4 w-4" />
                        <span>{transaction.walletId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`text-lg font-semibold ${
                  isIncome 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {isIncome ? "+" : "-"}${transaction.amount}
                </span>
                
                <button
                  onClick={() => handleDelete(transaction._id)}
                  className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Delete transaction"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TransactionList;
