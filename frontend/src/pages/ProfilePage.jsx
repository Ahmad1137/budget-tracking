import { useState, useEffect, useContext } from "react";
import { useDropzone } from "react-dropzone";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

function ProfilePage() {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    bio: "",
    profilePicture: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const res = await api.get("/api/auth/profile");
          setFormData({
            name: res.data.name || "",
            email: res.data.email || "",
            phoneNumber: res.data.phoneNumber || "",
            bio: res.data.bio || "",
            profilePicture: null,
          });
          setImagePreview(res.data.profilePicture || null);
        } catch (err) {
          console.error("Profile fetch error:", err);
          setError("Failed to fetch profile");
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setFormData({ ...formData, profilePicture: file });
        setImagePreview(URL.createObjectURL(file));
      }
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const data = new FormData();
    data.append("phoneNumber", formData.phoneNumber);
    data.append("bio", formData.bio);
    if (formData.profilePicture) {
      data.append("profilePicture", formData.profilePicture);
    }

    try {
      const res = await api.put("/api/auth/profile", data);
      setUser(res.data);
      setImagePreview(res.data.profilePicture || null);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg || "Failed to update profile"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">
          Please log in to view your profile
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          My Profile
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture or Icon */}
          <div className="flex flex-col items-center">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md mb-4"
              />
            ) : (
              <UserCircleIcon className="w-32 h-32 text-gray-400 border-4 border-blue-100 rounded-full mb-4" />
            )}
            <div
              {...getRootProps()}
              className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
            >
              <input {...getInputProps()} />
              <p>Upload new profile picture (JPG/PNG)</p>
            </div>
          </div>

          {/* Name (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+12345678901"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Tell us about yourself"
            />
          </div>

          {/* Messages */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-500 text-sm text-center">{success}</p>
          )}

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
