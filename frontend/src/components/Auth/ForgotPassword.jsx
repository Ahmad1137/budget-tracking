import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Mail, Key, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import api from "../../utils/api";

function ForgotPassword({ onBack }) {
  const { isDark } = useTheme();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      setResetToken(res.data.resetToken);
      setSuccess("OTP sent to your email");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await api.post("/api/auth/reset-password", {
        resetToken,
        otp,
        newPassword
      });
      setSuccess("Password reset successfully! You can now login.");
      setTimeout(() => onBack(), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 isDark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 isDark:text-blue-400 hover:text-blue-700 isDark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </button>
          <h2 className="text-3xl font-bold text-gray-900 isDark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-gray-600 isDark:text-gray-400">
            {step === 1 && "Enter your email to receive a reset code"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Enter your new password"}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 isDark:bg-red-900/20 border border-red-200 isDark:border-red-800 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 isDark:text-red-400" />
            <span className="text-red-700 isDark:text-red-400">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 isDark:bg-green-900/20 border border-green-200 isDark:border-green-800 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 isDark:text-green-400" />
            <span className="text-green-700 isDark:text-green-400">{success}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 isDark:text-gray-300 mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 isDark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white isDark:bg-gray-700 text-gray-900 isDark:text-white"
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={() => setStep(3)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 isDark:text-gray-300 mb-2">
                <Key className="inline h-4 w-4 mr-2" />
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 isDark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white isDark:bg-gray-700 text-gray-900 isDark:text-white text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-sm text-gray-500 isDark:text-gray-400 mt-2">
                Enter the 6-digit code sent to {email}
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Verify Code
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 isDark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 isDark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white isDark:bg-gray-700 text-gray-900 isDark:text-white"
                placeholder="Enter new password"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 isDark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 isDark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white isDark:bg-gray-700 text-gray-900 isDark:text-white"
                placeholder="Confirm new password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;