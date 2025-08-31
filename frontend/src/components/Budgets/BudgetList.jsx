import { Target, AlertTriangle, CheckCircle, DollarSign, Edit, Trash2, MoreVertical } from "lucide-react";
import { useState } from "react";
import api from "../../utils/api";
import BudgetForm from "./BudgetForm";

function BudgetList({ budgets, onUpdate }) {
  const [deletingId, setDeletingId] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const handleDelete = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      setDeletingId(budgetId);
      try {
        await api.delete(`/api/budgets/${budgetId}`);
        onUpdate && onUpdate();
      } catch (err) {
        console.error('Failed to delete budget:', err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (budgets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No budgets set</h3>
        <p className="text-gray-500 dark:text-gray-400">Create your first budget to start tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const spentPercentage = Math.min((budget.spent / budget.amount) * 100, 100);
        const isOverBudget = budget.overBudget;
        const isNearLimit = spentPercentage > 80 && !isOverBudget;
        
        return (
          <div
            key={budget._id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 card-hover"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  isOverBudget 
                    ? "bg-red-100 dark:bg-red-900/20" 
                    : isNearLimit 
                    ? "bg-yellow-100 dark:bg-yellow-900/20"
                    : "bg-green-100 dark:bg-green-900/20"
                }`}>
                  {isOverBudget ? (
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  ) : isNearLimit ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{budget.category}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {spentPercentage.toFixed(1)}% of budget used
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isOverBudget && (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium rounded-full">
                    Over Budget
                  </span>
                )}
                <div className="flex space-x-1">
                  <button 
                    onClick={() => setEditingBudget(budget)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-600 dark:text-blue-400"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(budget._id)}
                    disabled={deletingId === budget._id}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600 dark:text-red-400 disabled:opacity-50"
                  >
                    {deletingId === budget._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Budget</p>
                <p className="font-semibold text-gray-900 dark:text-white">${budget.amount}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Spent</p>
                <p className={`font-semibold ${
                  isOverBudget 
                    ? "text-red-600 dark:text-red-400" 
                    : "text-gray-900 dark:text-white"
                }`}>${budget.spent}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
                <p className={`font-semibold ${
                  budget.remaining < 0 
                    ? "text-red-600 dark:text-red-400" 
                    : "text-green-600 dark:text-green-400"
                }`}>${budget.remaining}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Progress</span>
                <span className={`font-medium ${
                  isOverBudget 
                    ? "text-red-600 dark:text-red-400" 
                    : "text-gray-900 dark:text-white"
                }`}>{spentPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    isOverBudget 
                      ? "bg-red-500" 
                      : isNearLimit 
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Edit Budget Modal */}
      {editingBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Budget</h3>
            <BudgetForm 
              budget={editingBudget}
              wallets={[]}
              onAdd={(updatedBudget) => {
                setEditingBudget(null);
                onUpdate && onUpdate();
              }}
              onCancel={() => setEditingBudget(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetList;
