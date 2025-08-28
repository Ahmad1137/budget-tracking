import { useState } from "react";
import api from "../../utils/api";

function WalletList({ wallets }) {
  const [joinId, setJoinId] = useState("");
  const [error, setError] = useState("");

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/api/wallets/${joinId}/join`);
      setJoinId("");
      window.location.reload(); // Refresh to update wallet list
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to join wallet");
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">Wallets</h3>
      <div className="max-w-md mx-auto mb-6">
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              Join Wallet by ID
            </label>
            <input
              type="text"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Wallet ID"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
          >
            Join Wallet
          </button>
        </form>
      </div>
      {wallets.length === 0 ? (
        <p className="text-gray-500">No wallets found</p>
      ) : (
        <div className="space-y-4">
          {wallets.map((wallet) => (
            <div key={wallet._id} className="p-4 bg-white rounded-lg shadow-md">
              <p className="font-medium">{wallet.name}</p>
              <p className="text-sm text-gray-500">{wallet.description}</p>
              <p className="text-sm text-gray-500">
                Members: {wallet.members.map((m) => m.name).join(", ")}
              </p>
              <p className="text-sm text-gray-500">ID: {wallet._id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WalletList;
