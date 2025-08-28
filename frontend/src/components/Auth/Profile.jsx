import { useState, useContext } from "react";
import { useDropzone } from "react-dropzone";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    phoneNumber: user?.phoneNumber || "",
    bio: user?.bio || "",
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
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
    if (file) data.append("profilePicture", file);

    try {
      const res = await api.put("/api/auth/profile", data);
      setUser(res.data);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.msg || "Update failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Update Profile</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      {user?.profilePicture && (
        <img
          src={user.profilePicture}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto mb-4"
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+12345678901"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        <div
          {...getRootProps()}
          className="border-2 border-dashed p-4 text-center"
        >
          <input {...getInputProps()} />
          <p>{file ? file.name : "Drag or click to upload profile picture"}</p>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}

export default Profile;
