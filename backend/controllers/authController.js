const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Register
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { name, email, password, phoneNumber, bio } = req.body; // Changed phone to phoneNumber
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({ name, email, password, phoneNumber, bio });
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).send("Server error");
  }
};

// Login
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
};

// Update Profile
const updateProfile = [
  upload.single("profilePicture"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { phoneNumber, bio } = req.body; // Changed phone to phoneNumber
    let updateData = { phoneNumber, bio };

    try {
      if (req.file) {
        // Use Promise for Cloudinary upload
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "budget-tracker/budget_profiles",
              resource_type: "image",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        updateData.profilePicture = result.secure_url;
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateData },
        { new: true, select: "-password" }
      );

      if (!user) return res.status(404).json({ msg: "User not found" });

      res.json({
        message: "Profile updated successfully",
        user,
      });
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(500).json({ msg: "Server error", error: err.message });
    }
  },
];

// Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).send("Server error");
  }
};

module.exports = { registerUser, loginUser, updateProfile, getProfile };
