const { ethers } = require("ethers");
const crypto = require("crypto");

/**
 * DID Service — generates DIDs, resolves them, registers on chain.
 */

/**
 * Generate a DID from a phone number seed.
 * Uses did:key method — derives keypair from phone-based seed.
 */
const generateDID = (seedInput) => {
  // Create deterministic seed from input
  const seed = crypto.createHash("sha256").update(seedInput + Date.now().toString()).digest();

  // Generate keypair using ethers
  const wallet = new ethers.Wallet(ethers.hexlify(seed));
  const publicKeyHex = wallet.publicKey;

  // Create did:key identifier
  const did = `did:key:z${Buffer.from(wallet.address).toString("base64url")}`;

  // Create DID Document
  const didDocument = {
    "@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/suites/jws-2020/v1"],
    id: did,
    verificationMethod: [
      {
        id: `${did}#keys-1`,
        type: "EcdsaSecp256k1VerificationKey2019",
        controller: did,
        publicKeyHex: publicKeyHex,
      },
    ],
    authentication: [`${did}#keys-1`],
    assertionMethod: [`${did}#keys-1`],
  };

  return {
    did,
    didDocument,
    privateKey: wallet.privateKey,
    address: wallet.address,
  };
};

/**
 * Resolve a DID from the blockchain registry.
 */
const resolveDID = async (did, registryContract) => {
  if (!registryContract) {
    return null;
  }
  try {
    const record = await registryContract.resolveDID(did);
    return {
      did: record.did,
      owner: record.owner,
      didDocumentHash: record.didDocumentHash,
      isActive: record.isActive,
      registeredAt: Number(record.registeredAt),
      updatedAt: Number(record.updatedAt),
    };
  } catch (error) {
    console.error("DID resolution error:", error.message);
    return null;
  }
};

/**
 * Register a DID on chain via RozgarIDRegistry.
 */
const registerDIDOnChain = async (did, didDocumentHash, registryContract) => {
  if (!registryContract) {
    console.warn("⚠️  Registry contract not available. Skipping on-chain registration.");
    return { txHash: null, blockNumber: null };
  }
  try {
    const tx = await registryContract.registerDID(did, didDocumentHash);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error("On-chain DID registration error:", error.message);
    return { txHash: null, blockNumber: null };
  }
};

module.exports = { generateDID, resolveDID, registerDIDOnChain };
