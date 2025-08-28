const express = require("express");
const {
  registerUser,
  loginUser,
  updateProfile,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"), // Changed to required to match model
    body("bio").optional().isString().withMessage("Bio must be a string"),
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").exists().withMessage("Password is required"),
  ],
  loginUser
);

router.put(
  "/profile",
  protect,
  [
    body("phoneNumber")
      .optional()
      .matches(/^\+\d{7,15}$/)
      .withMessage("Phone number must start with + followed by 7-15 digits"),
    body("bio").optional().isString().withMessage("Bio must be a string"),
  ],
  updateProfile
);

router.get("/profile", protect, getProfile);

module.exports = router;
