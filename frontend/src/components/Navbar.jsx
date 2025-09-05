import { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Menu, X, Wallet, BarChart3, CreditCard, Target, User, LogOut, FileText } from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/transactions", label: "Transactions", icon: CreditCard },
    { path: "/wallets", label: "Wallets", icon: Wallet },
    { path: "/budgets", label: "Budgets", icon: Target },
    { path: "/reports", label: "Reports", icon: FileText },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    
    <nav className={`${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50'} backdrop-blur-sm border sticky top-2 sm:top-4 rounded-2xl sm:rounded-full z-50 mx-2 sm:mx-12 md:mx-16 lg:mx-8 xl:mx-32 shadow-lg mb-4 sm:mb-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Wallet className="h-8 w-8 text-blue-600" />
              <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>BudgetTracker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-4 xl:space-x-8">
            {user ? (
              <>
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-1 px-1 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === path
                        ? `text-blue-600 ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50'}`
                        : `${isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-600 hover:text-red-600'} transition-colors`}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`${isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign Up
                </Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 isDark:text-white-300 isDark:hover:bg-transparent transition-colors"
            >
              {isDark ? <Sun className={`h-5 w-5 text-gray-300`} /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-transparent'} transition-colors`}
            >
              {isDark ? <Sun className="h-5 w-5 text-gray-300" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className={`lg:hidden ${isDark ? 'bg-gray-800/90 border-gray-700/50' : 'bg-white/90 border-gray-200/50'} backdrop-blur-md border-t rounded-b-2xl`}>
          <div className="px-3 sm:px-4 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      location.pathname === path
                        ? `text-blue-600 ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50'}`
                        : `${isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium ${isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-600 hover:text-red-600'} transition-colors`}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
