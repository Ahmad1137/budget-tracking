import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";

function WalletForm({ onAdd, onCancel }) {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/wallets", formData);
      onAdd(res.data);
      setFormData({ name: "", description: "" });
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create wallet");
    }
  };

  return (
    <div className={`max-w-md mx-auto p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border`}>
      <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Wallet</h2>
      {error && <p className={`${isDark ? 'text-red-400' : 'text-red-500'} mb-4`}>{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full p-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          ></textarea>
        </div>
        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Wallet
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default WalletForm;
