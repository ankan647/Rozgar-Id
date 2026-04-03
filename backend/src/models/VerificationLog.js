const mongoose = require("mongoose");

const verificationLogSchema = new mongoose.Schema(
  {
    verificationId: { type: String, required: true, unique: true },
    verifierId: { type: mongoose.Schema.Types.ObjectId, ref: "Verifier", required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
    credentialId: { type: mongoose.Schema.Types.ObjectId, ref: "Credential" },
    verifierDid: { type: String },
    workerDid: { type: String },
    result: {
      type: String,
      required: true,
      enum: ["verified", "revoked", "expired", "invalid"],
    },
    sharedFields: [{ type: String }],
    hiddenFields: [{ type: String }],
    blockchainTxHash: { type: String },
    blockNumber: { type: Number },
    verificationTimeMs: { type: Number },
    offlineVerification: { type: Boolean, default: false },
    syncedAt: { type: Date },
  },
  { timestamps: true }
);

verificationLogSchema.index({ verifierId: 1, createdAt: -1 });
verificationLogSchema.index({ result: 1 });

module.exports = mongoose.model("VerificationLog", verificationLogSchema);
