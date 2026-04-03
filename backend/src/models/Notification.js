const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    recipientType: {
      type: String,
      required: true,
      enum: ["worker", "issuer", "verifier"],
    },
    type: {
      type: String,
      required: true,
      enum: ["credential_issued", "credential_verified", "credential_revoked", "recovery_setup", "system"],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    credentialId: { type: mongoose.Schema.Types.ObjectId, ref: "Credential" },
    read: { type: Boolean, default: false },
    metadata: { type: Object },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
