import { Wallet, Users, Copy, Check } from "lucide-react";
import { useState } from "react";

function WalletList({ wallets, onCopyId }) {
  const [copiedId, setCopiedId] = useState(null);

  const copyWalletId = async (walletId) => {
    try {
      await navigator.clipboard.writeText(walletId);
      setCopiedId(walletId);
      setTimeout(() => setCopiedId(null), 2000);
      onCopyId && onCopyId(walletId);
    } catch (err) {
      console.error('Failed to copy wallet ID');
    }
  };

  if (wallets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 isDark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 isDark:text-white mb-2">No wallets found</h3>
        <p className="text-gray-500 isDark:text-gray-400">Create your first wallet or join an existing one</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {wallets.map((wallet) => (
        <div key={wallet._id} className="bg-white isDark:bg-gray-800 rounded-xl p-6 border border-gray-200 isDark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 isDark:bg-blue-900/20 rounded-lg">
                <Wallet className="h-5 w-5 text-blue-600 isDark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 isDark:text-white">{wallet.name}</h4>
                <p className="text-sm text-gray-500 isDark:text-gray-400">{wallet.description || "No description"}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 isDark:text-gray-400">
                  {wallet.members?.length || 0} members
                </span>
              </div>
            </div>
            
            <button
              onClick={() => copyWalletId(wallet._id)}
              className="text-xs text-gray-500 isDark:text-gray-400 hover:text-gray-700 isDark:hover:text-gray-300 flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 isDark:hover:bg-gray-700"
            >
              {copiedId === wallet._id ? (
                <><Check className="h-3 w-3" /><span>Copied!</span></>
              ) : (
                <><Copy className="h-3 w-3" /><span>Copy ID</span></>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default WalletList;
