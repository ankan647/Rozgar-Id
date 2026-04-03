const mongoose = require("mongoose");

const issuerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["training_institute", "employer", "government", "contractor"],
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true },
    did: { type: String, unique: true, sparse: true },
    didDocument: { type: Object },
    state: { type: String },
    city: { type: String },
    registrationNumber: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    totalIssued: { type: Number, default: 0 },
    totalRevoked: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issuer", issuerSchema);
