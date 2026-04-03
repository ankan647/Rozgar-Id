const router = require("express").Router();
const { auth, requireRole } = require("../middleware/auth");
const { getProfile, updateProfile, getStats, getCredentials, issueCredential, revokeCredential, getDID } = require("../controllers/issuerController");

router.use(auth, requireRole("issuer"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/stats", getStats);
router.get("/credentials", getCredentials);
router.post("/credentials/issue", issueCredential);
router.post("/credentials/revoke/:credentialId", revokeCredential);
router.get("/did", getDID);

module.exports = router;
