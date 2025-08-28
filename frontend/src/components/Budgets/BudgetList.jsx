function BudgetList({ budgets }) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">Budgets</h3>
      {budgets.length === 0 ? (
        <p className="text-gray-500">No budgets set</p>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget._id} className="p-4 bg-white rounded-lg shadow-md">
              <p className="font-medium">{budget.category}</p>
              <p className="text-sm text-gray-500">
                Budget: ${budget.amount} | Spent: ${budget.spent} | Remaining: $
                {budget.remaining}
              </p>
              {budget.overBudget && (
                <p className="text-red-500 text-sm">Over budget!</p>
              )}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      budget.overBudget ? "bg-red-500" : "bg-blue-600"
                    }`}
                    style={{
                      width: `${Math.min(
                        (budget.spent / budget.amount) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BudgetList;
