const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Register
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ 
      msg: errorMessages[0], // Return first error message
      errors: errors.array() 
    });
  }

  const { name, email, password, phoneNumber, bio } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ msg: "User with this email already exists" });
    }

    // Create new user
    user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase(), 
      password, 
      phoneNumber: phoneNumber || undefined, 
      bio: bio || undefined 
    });
    
    await user.save();

    // Generate JWT token
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" }, // Extended token life
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            bio: user.bio,
            profilePicture: user.profilePicture
          }
        });
      }
    );
  } catch (err) {
    console.error("Register error:", err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ msg: "User with this email already exists" });
    }
    
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

// Login
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ 
      msg: errorMessages[0],
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;
  try {
    // Find user by email (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Generate JWT token
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            bio: user.bio,
            profilePicture: user.profilePicture
          }
        });
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

// Update Profile
const updateProfile = [
  upload.single("profilePicture"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ 
        msg: errorMessages[0],
        errors: errors.array() 
      });
    }

    const { phoneNumber, bio } = req.body;
    let updateData = {};
    
    // Only update fields that are provided
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (bio !== undefined) updateData.bio = bio;

    try {
      // Handle profile picture upload
      if (req.file) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          return res.status(400).json({ msg: "Only JPEG, JPG and PNG files are allowed" });
        }
        
        // Validate file size (5MB limit)
        if (req.file.size > 5 * 1024 * 1024) {
          return res.status(400).json({ msg: "File size cannot exceed 5MB" });
        }

        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "budget-tracker/budget_profiles",
              resource_type: "image",
              transformation: [
                { width: 400, height: 400, crop: "fill" },
                { quality: "auto" }
              ]
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

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      res.json(user);
    } catch (err) {
      console.error("Profile update error:", err);
      
      if (err.name === 'ValidationError') {
        const errorMessages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ msg: errorMessages[0] });
      }
      
      res.status(500).json({ msg: "Server error. Please try again later." });
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

// Update Preferences
const updatePreferences = async (req, res) => {
  try {
    const allowedPreferences = ['notifications', 'currency', 'language', 'darkMode'];
    const updateData = {};
    
    // Only update allowed preference fields
    Object.keys(req.body).forEach(key => {
      if (allowedPreferences.includes(key)) {
        updateData[`preferences.${key}`] = req.body[key];
      }
    });
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ msg: "No valid preferences provided" });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, select: "-password" }
    );
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    res.json({ msg: "Preferences updated successfully", preferences: user.preferences });
  } catch (err) {
    console.error("Update preferences error:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: "Current password and new password are required" });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ msg: "New password must be at least 8 characters long" });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Generate 2FA Secret
const generate2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const secret = speakeasy.generateSecret({
      name: `BudgetTracker (${user.email})`,
      issuer: 'BudgetTracker'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save secret temporarily (not enabled yet)
    user.twoFactorSecret = secret.base32;
    await user.save();

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      msg: "Scan QR code with Google Authenticator"
    });
  } catch (err) {
    console.error("Generate 2FA error:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

// Enable 2FA
const enable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ msg: "2FA setup not initiated" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ msg: "Invalid verification code" });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ msg: "Two-factor authentication enabled successfully" });
  } catch (err) {
    console.error("Enable 2FA error:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

// Disable 2FA
const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.json({ msg: "Two-factor authentication disabled successfully" });
  } catch (err) {
    console.error("Disable 2FA error:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ msg: "No account found with this email address" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store OTP and token in user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset - BudgetTracker',
      html: `
        <h2>Password Reset Request</h2>
        <p>Your password reset OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ 
      msg: "Password reset OTP sent to your email",
      resetToken 
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { resetToken, otp, newPassword } = req.body;
    
    if (!resetToken || !otp || !newPassword) {
      return res.status(400).json({ msg: "Reset token, OTP, and new password are required" });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ msg: "Password must be at least 8 characters long" });
    }
    
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset token" });
    }
    
    // Verify OTP matches exactly
    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      return res.status(400).json({ msg: "Invalid OTP. Please check the code sent to your email." });
    }
    
    // Update password and clear reset fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.json({ msg: "Password reset successfully. You can now login with your new password." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

module.exports = { registerUser, loginUser, updateProfile, getProfile, updatePreferences, changePassword, generate2FA, enable2FA, disable2FA, forgotPassword, resetPassword };
