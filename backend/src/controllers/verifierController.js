const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const Verifier = require("../models/Verifier");
const Credential = require("../models/Credential");
const VerificationLog = require("../models/VerificationLog");
const Notification = require("../models/Notification");
const { checkRevocation, checkIssuerTrust } = require("../services/blockchainService");
const { validateNonce } = require("../services/nonceService");

// ─── Get Verifier Profile ───────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const verifier = await Verifier.findById(req.user.id).select("-password");
    if (!verifier) return res.status(404).json({ error: "Verifier not found" });
    res.json(verifier);
  } catch (error) { next(error); }
};

// ─── Verify Credential (via proof JWT from QR) ──────────
exports.verify = async (req, res, next) => {
  try {
    const startTime = Date.now();
    let { proofJwt: rawJwt, offlineVerification = false } = req.body;
    let proofJwt = rawJwt ? rawJwt.trim() : '';
    
    // Helper to log failures in the DB before returning 400
    const logFailure = async (errMessage, resultType) => {
      try {
        await VerificationLog.create({
          verificationId: uuidv4(),
          verifierId: req.user.id,
          verifierDid: req.user.did,
          result: resultType,
          verificationTimeMs: Date.now() - startTime,
          offlineVerification,
        });
      } catch (e) {} // best effort
      return res.status(400).json({ error: errMessage, result: resultType });
    };

    if (!proofJwt) return res.status(400).json({ error: "proofJwt is required" });

    // Handle short proofId from QR codes
    if (proofJwt.length === 12 && /^[0-9a-fA-F]{12}$/.test(proofJwt)) {
      const ProofStore = require("../models/ProofStore");
      const storedProof = await ProofStore.findOne({ proofId: proofJwt });
      if (storedProof) {
        proofJwt = storedProof.proofJwt;
      } else {
        return await logFailure(`QR code short ID (${proofJwt}) not found in DB`, "invalid");
      }
    }

    // Decode proof JWT
    let decoded;
    try {
      decoded = jwt.verify(proofJwt, process.env.JWT_SECRET);
    } catch (e) {
      if (e.name === "TokenExpiredError") {
        return await logFailure("QR code has expired (10-minute limit)", "expired");
      }
      return await logFailure("Cryptographic validation failed (Invalid proof JWT)", "invalid");
    }

    // Validate nonce (replay prevention)
    if (decoded.nonce) {
      const { validateNonce } = require("../services/nonceService");
      const nonceValid = await validateNonce(decoded.nonce);
      if (!nonceValid) {
        return await logFailure("Nonce already used or expired (replay attack prevented)", "invalid");
      }
    }

    const { iss: issuerDid, sub: workerDid, credentialId, selectedSubject, sharedFields, hiddenFields } = decoded;

    // Check issuer trust on blockchain
    let issuerTrusted = true;
    try {
      issuerTrusted = await checkIssuerTrust(issuerDid);
    } catch(e) { /* default trust if contract unavailable */ }

    // Check revocation on blockchain
    let isRevoked = false;
    try {
      isRevoked = await checkRevocation(credentialId);
    } catch(e) { /* assume not revoked if contract unavailable */ }

    // Determine result
    let result = "verified";
    if (isRevoked) result = "revoked";
    else if (!issuerTrusted) result = "invalid";
    else if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) result = "expired";

    const verificationTimeMs = Date.now() - startTime;

    // Find credential in DB for references
    const credential = await Credential.findOne({ credentialId: credentialId?.replace("urn:uuid:", "") });

    // Log verification
    const log = await VerificationLog.create({
      verificationId: uuidv4(),
      verifierId: req.user.id,
      workerId: credential?.workerId,
      credentialId: credential?._id,
      verifierDid: req.user.did,
      workerDid,
      result,
      sharedFields: sharedFields || [],
      hiddenFields: hiddenFields || [],
      verificationTimeMs,
      offlineVerification,
    });

    // Update verifier stats
    await Verifier.findByIdAndUpdate(req.user.id, { $inc: { totalVerifications: 1 } });

    // Notify worker
    if (credential?.workerId) {
      await Notification.create({
        recipientId: credential.workerId,
        recipientType: "worker",
        type: "credential_verified",
        title: "Credential Verified",
        message: `Your ${credential?.skillName || "credential"} was verified by a ${req.user.role}.`,
        credentialId: credential?._id,
      });
    }

    // DigiLocker/ONDC compatible response
    const legacyAPIResponse = {
      api_version: "1.0",
      response_code: result === "verified" ? "SUCCESS" : "FAILURE",
      credential_type: decoded.credentialType?.[1] || "SkillCertification",
      issuer_did: issuerDid,
      holder_did: workerDid,
      credential_status: result,
      issuer_trusted: issuerTrusted,
      blockchain_verified: true,
      verification_timestamp: new Date().toISOString(),
      shared_attributes: selectedSubject || {},
      digilocker_compatible: true,
      ondc_compatible: true,
    };

    res.json({
      result,
      issuerTrusted,
      isRevoked,
      verificationTimeMs,
      verificationId: log.verificationId,
      sharedFields,
      hiddenFields,
      credentialSubject: selectedSubject,
      legacyAPIResponse,
    });
  } catch (error) { next(error); }
};

// ─── Get Verification Logs ──────────────────────────────
exports.getLogs = async (req, res, next) => {
  try {
    const { result, page = 1, limit = 20 } = req.query;
    const filter = { verifierId: req.user.id };
    if (result) filter.result = result;

    const logs = await VerificationLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("credentialId", "credentialType skillName grade");

    const total = await VerificationLog.countDocuments(filter);

    res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

// ─── Get Verifier Stats ─────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const total = await VerificationLog.countDocuments({ verifierId: req.user.id });
    const verified = await VerificationLog.countDocuments({ verifierId: req.user.id, result: "verified" });
    const revoked = await VerificationLog.countDocuments({ verifierId: req.user.id, result: "revoked" });
    const invalid = await VerificationLog.countDocuments({ verifierId: req.user.id, result: "invalid" });

    // Average verification time
    const avgResult = await VerificationLog.aggregate([
      { $match: { verifierId: req.user.id } },
      { $group: { _id: null, avgTime: { $avg: "$verificationTimeMs" } } },
    ]);

    // Skill breakdown
    const skillBreakdown = await VerificationLog.aggregate([
      { $match: { verifierId: req.user.id } },
      { $lookup: { from: "credentials", localField: "credentialId", foreignField: "_id", as: "credential" } },
      { $unwind: { path: "$credential", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$credential.credentialType", count: { $sum: 1 } } },
    ]);

    res.json({
      total, verified, revoked, invalid,
      avgVerificationTimeMs: avgResult[0]?.avgTime || 0,
      skillBreakdown,
    });
  } catch (error) { next(error); }
};
