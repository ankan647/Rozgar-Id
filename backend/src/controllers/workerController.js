const Worker = require("../models/Worker");
const Credential = require("../models/Credential");
const Notification = require("../models/Notification");
const { generateSelectiveProof, verifyVC } = require("../services/vcService");
const { generateRecoveryPhrase, hashRecoveryPhrase, validateRecoveryPhrase, encryptBackup, decryptBackup } = require("../services/recoveryService");

// ─── Get Worker Profile ─────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.user.id).select("-password -privateKeyEncrypted -recoveryPhrase");
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    res.json(worker);
  } catch (error) { next(error); }
};

// ─── Update Worker Profile ──────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ["name", "homeState", "currentState", "skills"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    updates.profileComplete = true;

    const worker = await Worker.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password -privateKeyEncrypted");
    res.json(worker);
  } catch (error) { next(error); }
};

// ─── Get Worker Credentials ─────────────────────────────
exports.getCredentials = async (req, res, next) => {
  try {
    const credentials = await Credential.find({ workerId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("issuerId", "name type");
    res.json(credentials);
  } catch (error) { next(error); }
};

// ─── Get Single Credential ──────────────────────────────
exports.getCredentialById = async (req, res, next) => {
  try {
    const { credentialId } = req.params;
    // Guard against invalid ObjectId (e.g. "select" from misrouted requests)
    if (!credentialId || !credentialId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid credential ID" });
    }
    const credential = await Credential.findOne({ _id: credentialId, workerId: req.user.id })
      .populate("issuerId", "name type did");
    if (!credential) return res.status(404).json({ error: "Credential not found" });
    res.json(credential);
  } catch (error) { next(error); }
};

// ─── Generate Selective Disclosure Proof ─────────────────
exports.generateProof = async (req, res, next) => {
  try {
    const { credentialId, selectedFields } = req.body;

    const credential = await Credential.findOne({ _id: credentialId, workerId: req.user.id });
    if (!credential) return res.status(404).json({ error: "Credential not found" });
    if (credential.status !== "active") return res.status(400).json({ error: `Credential is ${credential.status}` });

    const proof = await generateSelectiveProof(credential.vcJwt, selectedFields);

    // Store proof JWT server-side with a short ID (QR codes encode only this short ID)
    const crypto = require("crypto");
    const ProofStore = require("../models/ProofStore");
    const proofId = crypto.randomBytes(6).toString("hex"); // 12-char hex ID
    await ProofStore.create({ proofId, proofJwt: proof.proofJwt });

    res.json({
      proofJwt: proof.proofJwt,
      proofId,
      qrData: proofId, // QR now encodes only the short ID
      expiresAt: proof.expiresAt,
      sharedFields: proof.sharedFields,
      hiddenFields: proof.hiddenFields,
    });
  } catch (error) { next(error); }
};

// ─── Get Worker Notifications ───────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user.id,
      recipientType: "worker",
    }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) { next(error); }
};

// ─── Setup Social Recovery ──────────────────────────────
exports.setupRecovery = async (req, res, next) => {
  try {
    const { contactPhone, contactName } = req.body;
    const worker = await Worker.findById(req.user.id);
    if (!worker) return res.status(404).json({ error: "Worker not found" });

    // Generate recovery phrase
    const phrase = generateRecoveryPhrase();
    const hashedPhrase = await hashRecoveryPhrase(phrase);

    // Encrypt credentials backup
    const credentials = await Credential.find({ workerId: req.user.id }).select("credentialId vcJwt credentialType skillName grade status");
    const backupData = { workerId: worker._id, did: worker.did, credentials };
    const encryptedBackup = encryptBackup(backupData, phrase);

    // Update worker
    worker.recoveryContact = { phone: contactPhone, name: contactName, encryptedBackup };
    worker.recoveryPhrase = hashedPhrase;
    await worker.save();

    // Notify
    await Notification.create({
      recipientId: worker._id,
      recipientType: "worker",
      type: "recovery_setup",
      title: "Recovery Setup Complete",
      message: "Your social recovery has been configured. Store your recovery phrase safely.",
    });

    res.json({
      message: "Recovery setup complete",
      recoveryPhrase: phrase, // Show to user ONCE
      contactName, contactPhone,
    });
  } catch (error) { next(error); }
};

// ─── Restore from Recovery ──────────────────────────────
exports.restoreRecovery = async (req, res, next) => {
  try {
    const { phone, recoveryPhrase } = req.body;

    const worker = await Worker.findOne({ phone });
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    if (!worker.recoveryPhrase) return res.status(400).json({ error: "Recovery not set up" });

    const valid = await validateRecoveryPhrase(recoveryPhrase, worker.recoveryPhrase);
    if (!valid) return res.status(401).json({ error: "Invalid recovery phrase" });

    // Decrypt backup
    const backup = decryptBackup(worker.recoveryContact.encryptedBackup, recoveryPhrase);

    res.json({
      message: "Recovery successful",
      worker: { id: worker._id, name: worker.name, did: worker.did, phone: worker.phone },
      credentials: backup.credentials,
    });
  } catch (error) { next(error); }
};
