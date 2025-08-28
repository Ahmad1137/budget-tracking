const express = require("express");
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getChartData,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");
const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/",
  protect,
  [
    body("type").isIn(["income", "expense"]),
    body("amount").isNumeric(),
    body("category").notEmpty(),
  ],
  addTransaction
);

router.get("/", protect, getTransactions);
router.get("/charts", protect, getChartData);
router.put("/:id", protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);

module.exports = router;
