const { registryContract, revocationContract, trustRegistryContract } = require("../config/blockchain");

/**
 * Blockchain Service — wraps smart contract interactions.
 */

/**
 * Revoke a credential on chain.
 */
const revokeOnChain = async (credentialId, issuerDid, workerDid, reason) => {
  if (!revocationContract) {
    console.warn("⚠️  Revocation contract not available.");
    return { txHash: null, blockNumber: null };
  }
  try {
    const tx = await revocationContract.revokeCredential(credentialId, issuerDid, workerDid, reason || "Revoked by issuer");
    const receipt = await tx.wait();
    return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
  } catch (error) {
    console.error("Revocation error:", error.message);
    throw error;
  }
};

/**
 * Check if a credential is revoked on chain.
 */
const checkRevocation = async (credentialId) => {
  if (!revocationContract) return false;
  try {
    return await revocationContract.isRevoked(credentialId);
  } catch (error) {
    console.error("Check revocation error:", error.message);
    return false;
  }
};

/**
 * Check if an issuer is trusted on chain.
 */
const checkIssuerTrust = async (issuerDid) => {
  if (!trustRegistryContract) return true; // Default trust if contract unavailable
  try {
    return await trustRegistryContract.isIssuerTrusted(issuerDid);
  } catch (error) {
    console.error("Check issuer trust error:", error.message);
    return false;
  }
};

/**
 * Add a trusted issuer on chain.
 */
const addTrustedIssuer = async (did, name, issuerType) => {
  if (!trustRegistryContract) {
    return { txHash: null, blockNumber: null };
  }
  try {
    const tx = await trustRegistryContract.addTrustedIssuer(did, name, issuerType);
    const receipt = await tx.wait();
    return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
  } catch (error) {
    console.error("Add trusted issuer error:", error.message);
    throw error;
  }
};

/**
 * Register DID on chain.
 */
const registerDID = async (did, didDocumentHash) => {
  if (!registryContract) {
    return { txHash: null, blockNumber: null };
  }
  try {
    const tx = await registryContract.registerDID(did, didDocumentHash);
    const receipt = await tx.wait();
    return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
  } catch (error) {
    console.error("Register DID error:", error.message);
    throw error;
  }
};

module.exports = { revokeOnChain, checkRevocation, checkIssuerTrust, addTrustedIssuer, registerDID };
