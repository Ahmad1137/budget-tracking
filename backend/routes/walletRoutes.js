const express = require("express");
const {
  createWallet,
  joinWallet,
  getWallets,
  deleteWallet,
} = require("../controllers/walletController");
const { protect } = require("../middleware/authMiddleware");
const { body } = require("express-validator");

const router = express.Router();

router.post("/", protect, [body("name").notEmpty()], createWallet);

router.post("/:walletId/join", protect, joinWallet);
router.get("/", protect, getWallets);
router.delete("/:id", protect, deleteWallet);

module.exports = router;
