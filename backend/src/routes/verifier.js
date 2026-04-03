const router = require("express").Router();
const { auth, requireRole } = require("../middleware/auth");
const { getProfile, verify, getLogs, getStats } = require("../controllers/verifierController");

router.use(auth, requireRole("verifier"));

router.get("/profile", getProfile);
router.post("/verify", verify);
router.get("/logs", getLogs);
router.get("/stats", getStats);

module.exports = router;
