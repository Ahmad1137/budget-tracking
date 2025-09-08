import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle, Wallet, Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { validateEmail } from "../../utils/validation";
import ForgotPassword from "./ForgotPassword";

function Login() {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors`}>
      <div className="max-w-md w-full">
        <motion.div 
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-8`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <motion.div 
                className={`${isDark ? 'bg-blue-900/20' : 'bg-blue-100'} p-3 rounded-full`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Wallet className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </motion.div>
            </div>
            <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Welcome back</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sign in to your account</p>
          </div>

          {errors.general && (
            <motion.div 
              className={`mb-6 p-4 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg flex items-center space-x-2`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              <span className={`${isDark ? 'text-red-400' : 'text-red-700'}`}>{errors.general}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} transition-colors ${
                    errors.email ? (isDark ? 'border-red-400' : 'border-red-500') : (isDark ? 'border-gray-600' : 'border-gray-300')
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {errors.email && (
                <motion.p 
                  className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} transition-colors ${
                    errors.password ? (isDark ? 'border-red-400' : 'border-red-500') : (isDark ? 'border-gray-600' : 'border-gray-300')
                  }`}
                  placeholder="Enter your password"
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isDark ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </motion.button>
              </div>
              {errors.password && (
                <motion.p 
                  className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </motion.button>
          </form>

          <motion.div 
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <button
              onClick={() => setShowForgotPassword(true)}
              className={`${isDark ? 'text-blue-400' : 'text-blue-600'} hover:text-blue-500 text-sm font-medium`}
            >
              Forgot your password?
            </button>
          </motion.div>

          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{" "}
              <Link to="/register" className={`${isDark ? 'text-blue-400' : 'text-blue-600'} hover:text-blue-500 font-medium`}>
                Sign up
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;