const { v4: uuidv4 } = require("uuid");
const Credential = require("../models/Credential");
const Worker = require("../models/Worker");
const Issuer = require("../models/Issuer");
const Notification = require("../models/Notification");
const { issueVC } = require("../services/vcService");
const { revokeOnChain } = require("../services/blockchainService");
const { uploadToIPFS } = require("../services/ipfsService");

// ─── Get Issuer Profile ─────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const issuer = await Issuer.findById(req.user.id).select("-password");
    if (!issuer) return res.status(404).json({ error: "Issuer not found" });
    res.json(issuer);
  } catch (error) { next(error); }
};

// ─── Update Issuer Profile ──────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "state", "city", "registrationNumber"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const issuer = await Issuer.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
    res.json(issuer);
  } catch (error) { next(error); }
};

// ─── Get Issuer Stats ───────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const issuer = await Issuer.findById(req.user.id);
    const totalIssued = await Credential.countDocuments({ issuerId: req.user.id });
    const totalActive = await Credential.countDocuments({ issuerId: req.user.id, status: "active" });
    const totalRevoked = await Credential.countDocuments({ issuerId: req.user.id, status: "revoked" });

    // Skill breakdown
    const skillBreakdown = await Credential.aggregate([
      { $match: { issuerId: issuer._id } },
      { $group: { _id: "$credentialType", count: { $sum: 1 } } },
    ]);

    // Recent credentials
    const recent = await Credential.find({ issuerId: req.user.id })
      .sort({ createdAt: -1 }).limit(5).populate("workerId", "name phone");

    res.json({
      totalIssued, totalActive, totalRevoked,
      skillBreakdown,
      recentCredentials: recent,
      issuerName: issuer.name,
      issuerDid: issuer.did,
    });
  } catch (error) { next(error); }
};

// ─── Get All Issued Credentials ─────────────────────────
exports.getCredentials = async (req, res, next) => {
  try {
    const { status, credentialType, page = 1, limit = 20 } = req.query;
    const filter = { issuerId: req.user.id };
    if (status) filter.status = status;
    if (credentialType) filter.credentialType = credentialType;

    const credentials = await Credential.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("workerId", "name phone did");

    const total = await Credential.countDocuments(filter);

    res.json({ credentials, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

// ─── Issue Credential ───────────────────────────────────
exports.issueCredential = async (req, res, next) => {
  try {
    const { workerPhone, credentialType, skillName, grade, expiryDate, additionalNotes } = req.body;

    const issuer = await Issuer.findById(req.user.id);
    if (!issuer) return res.status(404).json({ error: "Issuer not found" });

    const worker = await Worker.findOne({ phone: workerPhone });
    if (!worker) return res.status(404).json({ error: "Worker not found with this phone number" });

    // Issue W3C VC
    const { vcJson, vcJwt, credentialId } = await issueVC(
      issuer.did, worker.did,
      { credentialType, skillName, grade, expiryDate, additionalNotes,
        workerName: worker.name, issuerName: issuer.name }
    );

    // Upload to IPFS
    const { ipfsHash } = await uploadToIPFS(vcJson, `credential-${credentialId}`);

    // Save to DB
    const credential = await Credential.create({
      credentialId,
      issuerId: issuer._id,
      workerId: worker._id,
      issuerDid: issuer.did,
      workerDid: worker.did,
      credentialType, skillName, grade,
      issueDate: new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      vcJson, vcJwt, ipfsHash,
      status: "active",
      additionalNotes,
    });

    // Update worker credentials array
    await Worker.findByIdAndUpdate(worker._id, { $push: { credentials: credential._id } });

    // Update issuer stats
    await Issuer.findByIdAndUpdate(issuer._id, { $inc: { totalIssued: 1 } });

    // Notify worker
    await Notification.create({
      recipientId: worker._id,
      recipientType: "worker",
      type: "credential_issued",
      title: "New Credential Issued!",
      message: `${issuer.name} has issued you a ${skillName} (${credentialType}) credential.`,
      credentialId: credential._id,
    });

    console.log("📝 W3C VC JSON:", JSON.stringify(vcJson, null, 2));

    res.status(201).json({
      message: "Credential issued successfully",
      credential: {
        id: credential._id,
        credentialId,
        credentialType, skillName, grade,
        vcJson, vcJwt, ipfsHash,
        workerName: worker.name,
        workerDid: worker.did,
      },
    });
  } catch (error) { next(error); }
};

// ─── Revoke Credential ──────────────────────────────────
exports.revokeCredential = async (req, res, next) => {
  try {
    const { credentialId } = req.params;
    const { reason } = req.body;

    const credential = await Credential.findOne({ credentialId, issuerId: req.user.id });
    if (!credential) return res.status(404).json({ error: "Credential not found" });
    if (credential.status === "revoked") return res.status(400).json({ error: "Already revoked" });

    // Revoke on blockchain
    let chainResult = { txHash: null, blockNumber: null };
    try {
      chainResult = await revokeOnChain(credentialId, credential.issuerDid, credential.workerDid, reason);
    } catch (e) {
      console.warn("Blockchain revocation failed:", e.message);
    }

    // Update DB
    credential.status = "revoked";
    credential.revocationDate = new Date();
    credential.revocationReason = reason || "Revoked by issuer";
    credential.revocationTxHash = chainResult.txHash;
    await credential.save();

    await Issuer.findByIdAndUpdate(req.user.id, { $inc: { totalRevoked: 1 } });

    // Notify worker
    await Notification.create({
      recipientId: credential.workerId,
      recipientType: "worker",
      type: "credential_revoked",
      title: "Credential Revoked",
      message: `Your ${credential.skillName} credential has been revoked. Reason: ${reason || "Not specified"}`,
      credentialId: credential._id,
    });

    res.json({
      message: "Credential revoked successfully",
      revocationTxHash: chainResult.txHash,
      blockNumber: chainResult.blockNumber,
    });
  } catch (error) { next(error); }
};

// ─── Get DID Info ───────────────────────────────────────
exports.getDID = async (req, res, next) => {
  try {
    const issuer = await Issuer.findById(req.user.id).select("did didDocument name type");
    res.json(issuer);
  } catch (error) { next(error); }
};
