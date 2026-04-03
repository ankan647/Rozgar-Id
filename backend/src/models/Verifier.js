const mongoose = require("mongoose");

const verifierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["employer", "bank", "welfare_office", "contractor"],
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true },
    did: { type: String, unique: true, sparse: true },
    state: { type: String },
    city: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    totalVerifications: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Verifier", verifierSchema);
