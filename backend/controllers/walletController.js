const Wallet = require("../models/Wallet");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

// Create Wallet
const createWallet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const newWallet = new Wallet({
      ...req.body,
      ownerId: req.user.id,
      members: [req.user.id], // Owner is first member
    });
    const wallet = await newWallet.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { wallets: wallet._id },
    });
    res.json(wallet);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// Join Wallet (assuming invite via wallet ID)
const joinWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findById(req.params.walletId);
    if (!wallet) return res.status(404).json({ msg: "Wallet not found" });

    if (wallet.members.includes(req.user.id))
      return res.status(400).json({ msg: "Already a member" });

    wallet.members.push(req.user.id);
    await wallet.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { wallets: wallet._id },
    });
    res.json(wallet);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// Get User Wallets
const getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({ members: req.user.id }).populate(
      "members",
      "name email"
    );
    res.json(wallets);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

module.exports = { createWallet, joinWallet, getWallets };
