const mongoose = require("mongoose");

const credentialSchema = new mongoose.Schema(
  {
    credentialId: { type: String, required: true, unique: true },
    issuerId: { type: mongoose.Schema.Types.ObjectId, ref: "Issuer", required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true },
    issuerDid: { type: String, required: true },
    workerDid: { type: String, required: true },
    credentialType: {
      type: String,
      required: true,
      enum: [
        "WeldingCertification",
        "CarpentryCertification",
        "ElectricalCertification",
        "PlumbingCertification",
        "MasonryCertification",
        "DrivingLicense",
        "TailoringCertification",
        "WorkExperience",
        "WelfareEntitlement",
      ],
    },
    skillName: { type: String, required: true },
    grade: { type: String, enum: ["A", "B", "C", "D"] },
    issueDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    vcJson: { type: Object }, // Full W3C Verifiable Credential JSON
    vcJwt: { type: String },  // Signed JWT
    ipfsHash: { type: String },
    blockchainTxHash: { type: String },
    blockNumber: { type: Number },
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
    },
    revocationTxHash: { type: String },
    revocationDate: { type: Date },
    revocationReason: { type: String },
    additionalNotes: { type: String },
  },
  { timestamps: true }
);

// Index for fast lookups
credentialSchema.index({ issuerId: 1, status: 1 });
credentialSchema.index({ workerId: 1, status: 1 });
credentialSchema.index({ credentialType: 1 });

module.exports = mongoose.model("Credential", credentialSchema);
