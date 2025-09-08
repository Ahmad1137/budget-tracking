import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { User, Mail, Lock, Phone, FileText, AlertCircle, Wallet, Eye, EyeOff, CheckCircle } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { validateEmail, validatePassword, validateName, validatePhone } from "../../utils/validation";

function Register() {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    bio: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useContext(AuthContext);
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
    
    // Name validation
    const nameError = validateName(formData.name);
    if (nameError) {
      newErrors.name = nameError;
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors[0]; // Show first error
      }
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    // Phone validation (optional)
    const phoneError = validatePhone(formData.phoneNumber);
    if (phoneError) {
      newErrors.phoneNumber = phoneError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: "" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-600"];
    
    return {
      strength: score,
      label: labels[score] || "",
      color: colors[score] || "bg-green-600",
      width: `${(score / 5) * 100}%`
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate("/dashboard");
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors`}>
      <div className="max-w-md w-full">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border p-8`}>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className={`${isDark ? 'bg-blue-900/20' : 'bg-blue-100'} p-3 rounded-full`}>
                <Wallet className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
            <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Create account</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Start managing your budget today</p>
          </div>

          {errors.general && (
            <div className={`mb-6 p-4 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg flex items-center space-x-2`}>
              <AlertCircle className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              <span className={`${isDark ? 'text-red-400' : 'text-red-700'}`}>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} transition-colors ${
                    errors.name ? (isDark ? 'border-red-400' : 'border-red-500') : (isDark ? 'border-gray-600' : 'border-gray-300')
                  }`}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              {errors.name && (
                <p className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{errors.name}</p>
              )}
            </div>

            <div>
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
                <p className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{errors.email}</p>
              )}
            </div>

            <div>
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
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isDark ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Password strength:</span>
                    <span className={`font-medium ${
                      getPasswordStrength().strength >= 4 ? (isDark ? 'text-green-400' : 'text-green-600') :
                      getPasswordStrength().strength >= 3 ? (isDark ? 'text-blue-400' : 'text-blue-600') :
                      getPasswordStrength().strength >= 2 ? (isDark ? 'text-yellow-400' : 'text-yellow-600') :
                      (isDark ? 'text-red-400' : 'text-red-600')
                    }`}>
                      {getPasswordStrength().label}
                    </span>
                  </div>
                  <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength().color}`}
                      style={{ width: getPasswordStrength().width }}
                    />
                  </div>
                </div>
              )}
              {errors.password && (
                <p className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{errors.password}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} transition-colors ${
                    errors.confirmPassword ? (isDark ? 'border-red-400' : 'border-red-500') : (isDark ? 'border-gray-600' : 'border-gray-300')
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isDark ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className={`mt-1 flex items-center space-x-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Passwords match</span>
                </div>
              )}
              {errors.confirmPassword && (
                <p className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Phone number (optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} transition-colors ${
                    errors.phoneNumber ? (isDark ? 'border-red-400' : 'border-red-500') : (isDark ? 'border-gray-600' : 'border-gray-300')
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              {errors.phoneNumber && (
                <p className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{errors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Bio (optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none`}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create account</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{" "}
              <Link to="/login" className={`${isDark ? 'text-blue-400' : 'text-blue-600'} hover:text-blue-500 font-medium`}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;