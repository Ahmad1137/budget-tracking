const express = require("express");
const { setBudget, getBudgets } = require("../controllers/budgetController");
const { protect } = require("../middleware/authMiddleware");
const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/",
  protect,
  [
    body("category").notEmpty().withMessage("Category is required"),
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("year")
      .isInt({ min: 2000, max: 2100 })
      .withMessage("Valid year required"),
    body("month")
      .isInt({ min: 1, max: 12 })
      .withMessage("Valid month required"),
  ],
  setBudget
);

router.get("/", protect, getBudgets);

module.exports = router;
