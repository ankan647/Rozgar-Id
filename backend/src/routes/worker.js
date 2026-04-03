const router = require("express").Router();
const { auth, requireRole } = require("../middleware/auth");
const { getProfile, updateProfile, getCredentials, getCredentialById, generateProof, getNotifications, setupRecovery, restoreRecovery } = require("../controllers/workerController");

// Protected routes
router.get("/profile", auth, requireRole("worker"), getProfile);
router.put("/profile", auth, requireRole("worker"), updateProfile);
router.get("/credentials", auth, requireRole("worker"), getCredentials);
router.get("/credentials/:credentialId", auth, requireRole("worker"), getCredentialById);
router.post("/credentials/generate-proof", auth, requireRole("worker"), generateProof);
router.get("/notifications", auth, requireRole("worker"), getNotifications);
router.post("/recovery/setup", auth, requireRole("worker"), setupRecovery);

// Recovery restore (no auth — user locked out)
router.post("/recovery/restore", restoreRecovery);

module.exports = router;
