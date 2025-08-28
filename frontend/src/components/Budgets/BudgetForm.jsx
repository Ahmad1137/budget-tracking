import { useState } from "react";
import api from "../../utils/api";

function BudgetForm({ wallets, onAdd }) {
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    walletId: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/budgets", formData);
      onAdd(res.data);
      setFormData({
        category: "",
        amount: "",
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        walletId: "",
      });
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to set budget");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Set Budget</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Year</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Month</label>
          <input
            type="number"
            name="month"
            value={formData.month}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="12"
            required
          />
        </div>
        {wallets.length > 0 && (
          <div>
            <label className="block text-sm font-medium">Wallet</label>
            <select
              name="walletId"
              value={formData.walletId}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Personal</option>
              {wallets.map((wallet) => (
                <option key={wallet._id} value={wallet._id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          Set Budget
        </button>
      </form>
    </div>
  );
}

export default BudgetForm;
