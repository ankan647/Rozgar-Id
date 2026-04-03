const crypto = require("crypto");
const mongoose = require("mongoose");

/**
 * Nonce Service — generates and validates nonces for replay attack prevention.
 * Uses MongoDB with TTL index (auto-expiry after 15 minutes).
 */

// Nonce schema with TTL
const nonceSchema = new mongoose.Schema({
  nonce: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 900 }, // TTL: 15 min
});

const Nonce = mongoose.model("Nonce", nonceSchema);

/**
 * Generate a new nonce.
 */
const generateNonce = async () => {
  const nonce = crypto.randomBytes(32).toString("hex");
  await Nonce.create({ nonce });
  return nonce;
};

/**
 * Validate a nonce — marks as used to prevent replay.
 * Returns true if valid, false if already used or not found.
 */
const validateNonce = async (nonce) => {
  const record = await Nonce.findOneAndUpdate(
    { nonce, used: false },
    { used: true },
    { new: true }
  );
  return !!record;
};

module.exports = { generateNonce, validateNonce, Nonce };
