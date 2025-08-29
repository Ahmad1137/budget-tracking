const express = require("express");
const {
  registerUser,
  loginUser,
  updateProfile,
  getProfile,
  updatePreferences,
  changePassword,
  generate2FA,
  enable2FA,
  disable2FA,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Name can only contain letters and spaces"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
      .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    body("phoneNumber")
      .optional({ checkFalsy: true })
      .matches(/^\+?[\d\s\-\(\)]{10,}$/)
      .withMessage("Please enter a valid phone number"),
    body("bio")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Bio cannot exceed 500 characters"),
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address"),
    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  loginUser
);

router.put(
  "/profile",
  protect,
  [
    body("phoneNumber")
      .optional({ checkFalsy: true })
      .matches(/^\+?[\d\s\-\(\)]{10,}$/)
      .withMessage("Please enter a valid phone number"),
    body("bio")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Bio cannot exceed 500 characters"),
  ],
  updateProfile
);

router.get("/profile", protect, getProfile);
router.put("/preferences", protect, updatePreferences);
router.put("/change-password", protect, changePassword);
router.get("/generate-2fa", protect, generate2FA);
router.post("/enable-2fa", protect, enable2FA);
router.post("/disable-2fa", protect, disable2FA);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
