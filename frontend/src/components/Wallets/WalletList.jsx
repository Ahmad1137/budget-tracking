import { Wallet, Users, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

function WalletList({ wallets, onCopyId }) {
  const { isDark } = useTheme();
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
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Wallet className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No wallets found</h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Create your first wallet or join an existing one</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {wallets.map((wallet) => (
        <div key={wallet._id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border hover:shadow-lg transition-shadow`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'} rounded-lg`}>
                <Wallet className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{wallet.name}</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{wallet.description || "No description"}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-gray-400" />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {wallet.members?.length || 0} members
                </span>
              </div>
            </div>
            
            <button
              onClick={() => copyWalletId(wallet._id)}
              className={`text-xs ${isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} flex items-center space-x-1 px-2 py-1 rounded`}
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
