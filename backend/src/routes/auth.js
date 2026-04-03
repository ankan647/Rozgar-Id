const router = require("express").Router();
const { issuerRegister, issuerLogin, workerRegister, workerLogin, verifierRegister, verifierLogin, refreshToken } = require("../controllers/authController");

router.post("/issuer/register", issuerRegister);
router.post("/issuer/login", issuerLogin);
router.post("/worker/register", workerRegister);
router.post("/worker/login", workerLogin);
router.post("/verifier/register", verifierRegister);
router.post("/verifier/login", verifierLogin);
router.post("/refresh-token", refreshToken);

module.exports = router;
