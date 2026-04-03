const router = require("express").Router();
const { getStatus, verifyProof, getSchema, getAllSchemas, getNonce, getGlobalStats } = require("../controllers/credentialController");

router.get("/stats/global", getGlobalStats);
router.get("/schemas", getAllSchemas);
router.get("/schema/:type", getSchema);
router.get("/nonce", getNonce);
router.get("/:credentialId/status", getStatus);
router.get("/proof/:proofId", require("../controllers/credentialController").getProofById);
router.post("/verify-proof", verifyProof);

module.exports = router;
