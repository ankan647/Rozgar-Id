const mongoose = require("mongoose");

/**
 * ProofStore — temporary storage for proof JWTs.
 * QR codes encode only the short proofId; the verifier fetches the full JWT by ID.
 * TTL: auto-deletes after 15 minutes (matches proof expiry).
 */
const proofStoreSchema = new mongoose.Schema({
  proofId: { type: String, required: true, unique: true, index: true },
  proofJwt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 900 }, // TTL: 15 min
});

module.exports = mongoose.model("ProofStore", proofStoreSchema);
