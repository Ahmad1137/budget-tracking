import { useState, useContext, useEffect } from "react";
import { User, Wallet, Target, TrendingUp, Settings, Shield, Bell, Lock, Key, Smartphone, AlertCircle, CheckCircle } from "lucide-react";
import Profile from "../components/Auth/Profile";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";

// Security Settings Component
function SecuritySettings() {
  const { user } = useContext(AuthContext);
  const { isDark } = useTheme();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorData, setTwoFactorData] = useState({ secret: '', qrCode: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generate2FASecret = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await api.get('/api/auth/generate-2fa');
      setTwoFactorData({
        secret: res.data.secret,
        qrCode: res.data.qrCode
      });
      setShow2FASetup(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to generate 2FA secret');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.put('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.post('/api/auth/enable-2fa', { token: verificationCode });
      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      setVerificationCode('');
      setSuccess('Two-factor authentication enabled successfully');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable 2FA?')) return;
    
    setLoading(true);
    setError('');
    
    try {
      await api.post('/api/auth/disable-2fa');
      setTwoFactorEnabled(false);
      setSuccess('Two-factor authentication disabled');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6`}>
      <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Security Settings</h3>
      
      {error && (
        <div className={`mb-4 p-4 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg flex items-center space-x-2`}>
          <AlertCircle className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          <span className={`${isDark ? 'text-red-400' : 'text-red-700'}`}>{error}</span>
        </div>
      )}
      
      {success && (
        <div className={`mb-4 p-4 ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border rounded-lg flex items-center space-x-2`}>
          <CheckCircle className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          <span className={`${isDark ? 'text-green-400' : 'text-green-700'}`}>{success}</span>
        </div>
      )}
      
      <div className="space-y-6">
        <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Lock className="h-5 w-5 text-gray-400" />
              <div>
                <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Password</h4>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Keep your account secure</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Change Password
            </button>
          </div>
          
          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className={`mt-4 space-y-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg`}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg`}
                required
                minLength={8}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg`}
                required
              />
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} pb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-gray-400" />
              <div>
                <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication</h4>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  {twoFactorEnabled ? 'Your account is protected with Google Authenticator' : 'Secure your account with Google Authenticator'}
                </p>
              </div>
            </div>
            {twoFactorEnabled ? (
              <button
                onClick={disable2FA}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {loading ? 'Processing...' : 'Disable 2FA'}
              </button>
            ) : (
              <button
                onClick={generate2FASecret}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {loading ? 'Generating...' : 'Setup 2FA'}
              </button>
            )}
          </div>
          
          {show2FASetup && (
            <div className={`mt-4 p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Setup Google Authenticator</h5>
              <div className="space-y-4">
                <div className="text-center">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    1. Install Google Authenticator on your phone
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    2. Scan this QR code with the app:
                  </p>
                  {twoFactorData.qrCode && (
                    <img 
                      src={twoFactorData.qrCode} 
                      alt="QR Code" 
                      className="mx-auto mb-4 border rounded-lg"
                    />
                  )}
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    Or enter this secret manually: <code className={`${isDark ? 'bg-gray-600' : 'bg-gray-200'} px-2 py-1 rounded text-xs`}>{twoFactorData.secret}</code>
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    3. Enter the 6-digit code from your app:
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg text-center text-xl tracking-widest`}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={enable2FA}
                    disabled={loading || !verificationCode}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {loading ? 'Verifying...' : 'Enable 2FA'}
                  </button>
                  <button
                    onClick={() => setShow2FASetup(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <Key className="h-5 w-5 text-gray-400" />
            <div>
              <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Active Sessions</h4>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Current login session</p>
            </div>
          </div>
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Current Session</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active now</p>
              </div>
              <span className={`${isDark ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-100'} text-sm font-medium px-2 py-1 rounded`}>
                Current
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [stats, setStats] = useState({
    totalWallets: 0,
    totalBudgets: 0,
    totalTransactions: 0,
    monthlySpending: 0
  });
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
    currency: "USD",
    language: "en"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const [walletsRes, budgetsRes, transactionsRes] = await Promise.all([
        api.get("/api/wallets"),
        api.get(`/api/budgets?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`),
        api.get("/api/transactions")
      ]);
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyTransactions = transactionsRes.data.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      });
      
      setStats({
        totalWallets: walletsRes.data.length,
        totalBudgets: budgetsRes.data.length,
        totalTransactions: transactionsRes.data.length,
        monthlySpending: monthlyTransactions.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0)
      });
    } catch (err) {
      console.error("Failed to fetch user stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    try {
      setPreferences(prev => ({ ...prev, [key]: value }));
      // API call to save preferences would go here
      await api.put("/api/auth/preferences", { [key]: value });
    } catch (err) {
      console.error("Failed to update preferences:", err);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "stats", label: "Statistics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "security", label: "Security", icon: Shield }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      
      case "stats":
        return (
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6`}>
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Your Statistics</h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} p-4 rounded-lg`}>
                  <div className="flex items-center space-x-3">
                    <Wallet className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Wallets</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalWallets}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`${isDark ? 'bg-green-900/20' : 'bg-green-50'} p-4 rounded-lg`}>
                  <div className="flex items-center space-x-3">
                    <Target className={`h-8 w-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Budgets</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalBudgets}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`${isDark ? 'bg-purple-900/20' : 'bg-purple-50'} p-4 rounded-lg`}>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className={`h-8 w-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Transactions</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalTransactions}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`${isDark ? 'bg-orange-900/20' : 'bg-orange-50'} p-4 rounded-lg`}>
                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 ${isDark ? 'bg-orange-400' : 'bg-orange-600'} rounded-full flex items-center justify-center text-white font-bold`}>$</div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>This Month's Spending</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${stats.monthlySpending}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <h4 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Account Overview</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Member since</span>
                  <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Account status</span>
                  <span className={`${isDark ? 'text-green-400' : 'text-green-600'} font-medium`}>✓ Active</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Profile completion</span>
                  <span className={`${isDark ? 'text-blue-400' : 'text-blue-600'} font-medium`}>85%</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "settings":
        return (
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-6`}>
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>Notifications</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Receive email notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 isDark:peer-focus:ring-blue-800 rounded-full peer isDark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all isDark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Currency</label>
                <select
                  value={preferences.currency}
                  onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                  className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="en">English</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="de">Deutsch (German)</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case "security":
        return <SecuritySettings />;
      
      default:
        return null;
    }
  };

  return (
    <div className={`container mx-auto mt-6 px-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen transition-colors`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 pt-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Account Settings</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage your profile, preferences, and security settings</p>
        </div>
        
        {/* Tabs */}
        <div className={`flex flex-wrap border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-8`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? `border-blue-500 ${isDark ? 'text-blue-400' : 'text-blue-600'}`
                    : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Tab Content */}
        <div className="mb-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;