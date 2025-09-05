import { useState, useContext } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useDropzone } from "react-dropzone";
import { Camera, User, Phone, FileText, CheckCircle, AlertCircle } from "lucide-react";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

function Profile() {
  const { isDark } = useTheme();
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.bio || "",
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    onDrop: (acceptedFiles) => {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      if (selectedFile) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      }
    },
    noClick: true
  });

  const handleCameraClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      }
    };
    input.click();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    const data = new FormData();
    data.append("name", formData.name);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("bio", formData.bio);
    if (file) data.append("profilePicture", file);

    try {
      const res = await api.put("/api/auth/profile", data);
      setUser(res.data);
      setSuccess("Profile updated successfully");
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white isDark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 isDark:border-gray-700 overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 isDark:text-white mb-2">Profile Settings</h1>
            <p className="text-gray-600 isDark:text-gray-400">Update your personal information</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 isDark:bg-red-900/20 border border-red-200 isDark:border-red-800 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 isDark:text-red-400" />
              <span className="text-red-700 isDark:text-red-400">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 isDark:bg-green-900/20 border border-green-200 isDark:border-green-800 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 isDark:text-green-400" />
              <span className="text-green-700 isDark:text-green-400">{success}</span>
            </div>
          )}

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-100 isDark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400 isDark:text-gray-500" />
                )}
              </div>
              <button
                type="button"
                onClick={handleCameraClick}
                className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 rounded-full p-2 transition-colors"
              >
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 isDark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 isDark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white isDark:bg-gray-700 text-gray-900 isDark:text-white transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 isDark:text-gray-300 mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 isDark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white isDark:bg-gray-700 text-gray-900 isDark:text-white transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 isDark:text-gray-300 mb-2">
                <FileText className="inline h-4 w-4 mr-2" />
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 isDark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white isDark:bg-gray-700 text-gray-900 isDark:text-white transition-colors resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Profile</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
