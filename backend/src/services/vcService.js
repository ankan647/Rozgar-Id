const { createVerifiableCredentialJwt } = require("did-jwt-vc");
const { EdDSASigner } = require("did-jwt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { generateNonce } = require("./nonceService");

/**
 * VC Service — W3C Verifiable Credential issuance, verification, selective disclosure.
 */

/**
 * Issue a W3C Verifiable Credential.
 */
const issueVC = async (issuerDid, workerDid, credentialData, issuerPrivateKey) => {
  const credentialId = `urn:uuid:${uuidv4()}`;

  // Build W3C VC JSON
  const vcJson = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1",
    ],
    id: credentialId,
    type: ["VerifiableCredential", credentialData.credentialType || "SkillCertification"],
    issuer: issuerDid,
    issuanceDate: new Date().toISOString(),
    expirationDate: credentialData.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    credentialSubject: {
      id: workerDid,
      name: credentialData.workerName,
      skillName: credentialData.skillName,
      credentialType: credentialData.credentialType,
      grade: credentialData.grade,
      issuerName: credentialData.issuerName,
      issuedAt: new Date().toISOString(),
      additionalNotes: credentialData.additionalNotes || "",
    },
  };

  // Sign as JWT. For production, we use the issuer's private key.
  // Using a simple JWT sign here for broad compatibility.
  const vcJwt = jwt.sign(
    {
      vc: vcJson,
      sub: workerDid,
      iss: issuerDid,
      nbf: Math.floor(Date.now() / 1000),
      exp: credentialData.expiryDate
        ? Math.floor(new Date(credentialData.expiryDate).getTime() / 1000)
        : Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
    },
    issuerPrivateKey || process.env.JWT_SECRET,
    { algorithm: "HS256" }
  );

  console.log("📝 W3C VC JSON issued:", JSON.stringify(vcJson, null, 2));

  return { vcJson, vcJwt, credentialId };
};

/**
 * Verify a VC JWT — checks signature, expiry, and decodes.
 */
const verifyVC = (vcJwt, secretOrKey) => {
  try {
    const decoded = jwt.verify(vcJwt, secretOrKey || process.env.JWT_SECRET);

    // Check expiry
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, reason: "expired", decoded: null };
    }

    return { valid: true, reason: "valid", decoded };
  } catch (error) {
    return { valid: false, reason: error.message, decoded: null };
  }
};

/**
 * Generate a selective disclosure proof with only selected fields.
 * Adds exp claim for 10-minute expiry.
 */
const generateSelectiveProof = async (vcJwt, selectedFields, secretOrKey) => {
  const verifyResult = verifyVC(vcJwt, secretOrKey);
  if (!verifyResult.valid) {
    throw new Error(`VC invalid: ${verifyResult.reason}`);
  }

  const fullVC = verifyResult.decoded.vc;
  const fullSubject = fullVC.credentialSubject;

  // Build selective subject with only chosen fields
  const selectiveSubject = { id: fullSubject.id };
  const sharedFields = [];
  const hiddenFields = [];

  Object.keys(fullSubject).forEach((key) => {
    if (key === "id") return;
    if (selectedFields.includes(key)) {
      selectiveSubject[key] = fullSubject[key];
      sharedFields.push(key);
    } else {
      hiddenFields.push(key);
    }
  });

  // Generate nonce for replay prevention (stored in DB for validation)
  const nonce = await generateNonce();

  // Create proof JWT with 10-minute expiry
  const proofPayload = {
    type: "SelectiveDisclosureProof",
    iss: fullVC.issuer,
    sub: fullSubject.id,
    nonce,
    credentialId: fullVC.id,
    credentialType: fullVC.type,
    issuanceDate: fullVC.issuanceDate,
    selectedSubject: selectiveSubject,
    sharedFields,
    hiddenFields,
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 10 * 60, // 10-minute expiry
  };

  const proofJwt = jwt.sign(proofPayload, secretOrKey || process.env.JWT_SECRET, {
    algorithm: "HS256",
  });

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  return {
    proofJwt,
    qrData: proofJwt,
    expiresAt,
    sharedFields,
    hiddenFields,
    nonce,
  };
};

module.exports = { issueVC, verifyVC, generateSelectiveProof };
