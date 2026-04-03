const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateTokens } = require("../middleware/auth");
const { generateDID } = require("../services/didService");
const { registerDID } = require("../services/blockchainService");
const { addTrustedIssuer } = require("../services/blockchainService");
const Issuer = require("../models/Issuer");
const Worker = require("../models/Worker");
const Verifier = require("../models/Verifier");

// ─── Issuer Auth ────────────────────────────────────────

exports.issuerRegister = async (req, res, next) => {
  try {
    const { name, type, email, phone, password, state, city, registrationNumber } = req.body;

    const existing = await Issuer.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate DID
    const didResult = generateDID(email);

    // Register DID on chain (non-blocking)
    let chainResult = { txHash: null, blockNumber: null };
    try {
      chainResult = await registerDID(didResult.did, "ipfs://placeholder");
    } catch (e) {
      console.warn("Skipping on-chain DID registration:", e.message);
    }

    // Add as trusted issuer on chain
    try {
      await addTrustedIssuer(didResult.did, name, type);
    } catch (e) {
      console.warn("Skipping trusted issuer registration:", e.message);
    }

    const issuer = await Issuer.create({
      name, type, email, phone, state, city, registrationNumber,
      password: hashedPassword,
      did: didResult.did,
      didDocument: didResult.didDocument,
      isVerified: true,
    });

    const tokens = generateTokens({ id: issuer._id, role: "issuer", did: issuer.did });

    res.status(201).json({
      message: "Issuer registered successfully",
      issuer: { id: issuer._id, name: issuer.name, did: issuer.did, email: issuer.email },
      blockchainTx: chainResult.txHash,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

exports.issuerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const issuer = await Issuer.findOne({ email });
    if (!issuer) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, issuer.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const tokens = generateTokens({ id: issuer._id, role: "issuer", did: issuer.did });
    res.json({
      message: "Login successful",
      issuer: { id: issuer._id, name: issuer.name, did: issuer.did, email: issuer.email },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Worker Auth ────────────────────────────────────────

exports.workerRegister = async (req, res, next) => {
  try {
    const { name, phone, password, homeState, currentState, skills } = req.body;

    const existing = await Worker.findOne({ phone });
    if (existing) return res.status(409).json({ error: "Phone already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const didResult = generateDID(phone);

    let chainResult = { txHash: null };
    try {
      chainResult = await registerDID(didResult.did, "ipfs://placeholder");
    } catch (e) {
      console.warn("Skipping on-chain DID registration:", e.message);
    }

    const worker = await Worker.create({
      name, phone, homeState, currentState, skills,
      password: hashedPassword,
      did: didResult.did,
      didDocument: didResult.didDocument,
      privateKeyEncrypted: didResult.privateKey, // In production, encrypt with user passphrase
    });

    const tokens = generateTokens({ id: worker._id, role: "worker", did: worker.did });

    res.status(201).json({
      message: "Worker registered successfully",
      worker: { id: worker._id, name: worker.name, did: worker.did, phone: worker.phone },
      blockchainTx: chainResult.txHash,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

exports.workerLogin = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const worker = await Worker.findOne({ phone });
    if (!worker) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, worker.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const tokens = generateTokens({ id: worker._id, role: "worker", did: worker.did });
    res.json({
      message: "Login successful",
      worker: { id: worker._id, name: worker.name, did: worker.did, phone: worker.phone },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Verifier Auth ──────────────────────────────────────

exports.verifierRegister = async (req, res, next) => {
  try {
    const { name, type, email, phone, password, state, city } = req.body;

    const existing = await Verifier.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const didResult = generateDID(email);

    let chainResult = { txHash: null };
    try {
      chainResult = await registerDID(didResult.did, "ipfs://placeholder");
    } catch (e) {
      console.warn("Skipping on-chain DID registration:", e.message);
    }

    const verifier = await Verifier.create({
      name, type, email, phone, state, city,
      password: hashedPassword,
      did: didResult.did,
    });

    const tokens = generateTokens({ id: verifier._id, role: "verifier", did: verifier.did });

    res.status(201).json({
      message: "Verifier registered successfully",
      verifier: { id: verifier._id, name: verifier.name, did: verifier.did, email: verifier.email },
      blockchainTx: chainResult.txHash,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifierLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const verifier = await Verifier.findOne({ email });
    if (!verifier) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, verifier.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const tokens = generateTokens({ id: verifier._id, role: "verifier", did: verifier.did });
    res.json({
      message: "Login successful",
      verifier: { id: verifier._id, name: verifier.name, did: verifier.did, email: verifier.email },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Refresh Token ──────────────────────────────────────

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokens = generateTokens({ id: decoded.id, role: decoded.role, did: decoded.did });
    res.json(tokens);
  } catch (error) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};
