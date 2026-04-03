const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    did: { type: String, unique: true, sparse: true },
    didDocument: { type: Object },
    privateKeyEncrypted: { type: String },
    homeState: { type: String },
    currentState: { type: String },
    skills: [{ type: String }],
    profileComplete: { type: Boolean, default: false },
    recoveryContact: {
      phone: { type: String },
      name: { type: String },
      encryptedBackup: { type: String },
    },
    recoveryPhrase: { type: String }, // hashed
    credentials: [{ type: mongoose.Schema.Types.ObjectId, ref: "Credential" }],
    notificationTokens: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Worker", workerSchema);
