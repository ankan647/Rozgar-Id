const Credential = require("../models/Credential");
const { verifyVC } = require("../services/vcService");
const { checkRevocation } = require("../services/blockchainService");
const { generateNonce } = require("../services/nonceService");

// Credential schemas
const SCHEMAS = {
  WeldingCertification: {
    type: "WeldingCertification",
    name: "Welding Certification",
    fields: ["name", "skillName", "grade", "issuerName", "issuedAt"],
    description: "Certification for welding skills (arc, gas, TIG, MIG)",
  },
  CarpentryCertification: {
    type: "CarpentryCertification",
    name: "Carpentry Certification",
    fields: ["name", "skillName", "grade", "issuerName", "issuedAt"],
    description: "Certification for carpentry and woodworking skills",
  },
  ElectricalCertification: {
    type: "ElectricalCertification",
    name: "Electrical Certification",
    fields: ["name", "skillName", "grade", "issuerName", "issuedAt"],
    description: "Certification for electrical wiring and installation",
  },
  PlumbingCertification: {
    type: "PlumbingCertification",
    name: "Plumbing Certification",
    fields: ["name", "skillName", "grade", "issuerName", "issuedAt"],
    description: "Certification for plumbing and pipe fitting",
  },
  MasonryCertification: {
    type: "MasonryCertification",
    name: "Masonry Certification",
    fields: ["name", "skillName", "grade", "issuerName", "issuedAt"],
    description: "Certification for bricklaying and stonework",
  },
  DrivingLicense: {
    type: "DrivingLicense",
    name: "Driving License",
    fields: ["name", "skillName", "grade", "issuerName", "issuedAt"],
    description: "Driving license for commercial or personal vehicles",
  },
  TailoringCertification: {
    type: "TailoringCertification",
    name: "Tailoring Certification",
    fields: ["name", "skillName", "grade", "issuerName", "issuedAt"],
    description: "Certification for tailoring and garment making",
  },
  WorkExperience: {
    type: "WorkExperience",
    name: "Work Experience",
    fields: ["name", "skillName", "grade", "issuerName", "issuedAt", "additionalNotes"],
    description: "Verified work experience credential",
  },
  WelfareEntitlement: {
    type: "WelfareEntitlement",
    name: "Welfare Entitlement",
    fields: ["name", "skillName", "issuerName", "issuedAt", "additionalNotes"],
    description: "Government welfare scheme entitlement",
  },
};

// ─── Get Credential Status ──────────────────────────────
exports.getStatus = async (req, res, next) => {
  try {
    const { credentialId } = req.params;
    const credential = await Credential.findOne({ credentialId })
      .select("credentialId status credentialType skillName issueDate expiryDate revocationDate");

    if (!credential) return res.status(404).json({ error: "Credential not found" });

    // Check blockchain revocation
    let blockchainRevoked = false;
    try {
      blockchainRevoked = await checkRevocation(credentialId);
    } catch(e) {}

    res.json({
      ...credential.toObject(),
      blockchainRevoked,
    });
  } catch (error) { next(error); }
};

// ─── Verify Proof (public endpoint) ─────────────────────
exports.verifyProof = async (req, res, next) => {
  try {
    const { proofJwt } = req.body;
    if (!proofJwt) return res.status(400).json({ error: "proofJwt required" });

    const result = verifyVC(proofJwt);
    res.json(result);
  } catch (error) { next(error); }
};

// ─── Get Proof By ID (for short QR codes) ─────────────────
exports.getProofById = async (req, res, next) => {
  try {
    const ProofStore = require("../models/ProofStore");
    const { proofId } = req.params;
    const proofRecord = await ProofStore.findOne({ proofId });
    if (!proofRecord) return res.status(404).json({ error: "Proof not found or expired" });
    res.json({ proofJwt: proofRecord.proofJwt });
  } catch (error) { next(error); }
};

// ─── Get Schema ─────────────────────────────────────────
exports.getSchema = async (req, res, next) => {
  try {
    const { type } = req.params;
    const schema = SCHEMAS[type];
    if (!schema) {
      return res.status(404).json({ error: "Schema not found", availableTypes: Object.keys(SCHEMAS) });
    }
    res.json(schema);
  } catch (error) { next(error); }
};

// ─── Get All Schemas ────────────────────────────────────
exports.getAllSchemas = async (req, res) => {
  res.json(Object.values(SCHEMAS));
};

// ─── Generate Nonce (for verification) ──────────────────
exports.getNonce = async (req, res, next) => {
  try {
    const nonce = await generateNonce();
    res.json({ nonce });
  } catch (error) { next(error); }
};

// ─── Global Stats (for impact counter) ──────────────────
exports.getGlobalStats = async (req, res, next) => {
  try {
    const Issuer = require("../models/Issuer");
    const Worker = require("../models/Worker");
    const VerificationLog = require("../models/VerificationLog");

    const totalDIDs = await Worker.countDocuments() + await Issuer.countDocuments();
    const totalCredentials = await Credential.countDocuments();
    const totalVerifications = await VerificationLog.countDocuments();

    res.json({ totalDIDs, totalCredentials, totalVerifications });
  } catch (error) { next(error); }
};
