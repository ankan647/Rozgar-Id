const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

// Load contract ABIs from compiled artifacts
let RozgarIDRegistryABI, CredentialRevocationABI, IssuerTrustRegistryABI;

try {
  const artifactsBase = path.join(__dirname, "..", "..", "..", "contracts", "artifacts");
  RozgarIDRegistryABI = require(path.join(artifactsBase, "RozgarIDRegistry.sol", "RozgarIDRegistry.json")).abi;
  CredentialRevocationABI = require(path.join(artifactsBase, "CredentialRevocation.sol", "CredentialRevocation.json")).abi;
  IssuerTrustRegistryABI = require(path.join(artifactsBase, "IssuerTrustRegistry.sol", "IssuerTrustRegistry.json")).abi;
} catch (e) {
  console.warn("⚠️  Contract artifacts not found. Run `npx hardhat compile` in contracts/ first.");
  RozgarIDRegistryABI = [];
  CredentialRevocationABI = [];
  IssuerTrustRegistryABI = [];
}

// Load deployed contract addresses
let deployedAddresses = {};
try {
  const deployedPath = path.join(__dirname, "deployedContracts.json");
  if (fs.existsSync(deployedPath)) {
    deployedAddresses = require(deployedPath).contracts;
  } else {
    // Try from contracts directory
    const contractsDeployedPath = path.join(__dirname, "..", "..", "..", "contracts", "deployedContracts.json");
    if (fs.existsSync(contractsDeployedPath)) {
      deployedAddresses = require(contractsDeployedPath).contracts;
    }
  }
} catch (e) {
  console.warn("⚠️  deployedContracts.json not found. Deploy contracts first.");
}

// Provider & Signer
const rpcUrl = process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology";
const provider = new ethers.JsonRpcProvider(rpcUrl);

let signer = null;
if (process.env.PRIVATE_KEY) {
  signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
}

// Contract instances
const registryAddress = process.env.ROZGARID_REGISTRY_ADDRESS || deployedAddresses.RozgarIDRegistry || "";
const revocationAddress = process.env.CREDENTIAL_REVOCATION_ADDRESS || deployedAddresses.CredentialRevocation || "";
const trustRegistryAddress = process.env.ISSUER_TRUST_REGISTRY_ADDRESS || deployedAddresses.IssuerTrustRegistry || "";

let registryContract = null;
let revocationContract = null;
let trustRegistryContract = null;

if (registryAddress && signer) {
  registryContract = new ethers.Contract(registryAddress, RozgarIDRegistryABI, signer);
}
if (revocationAddress && signer) {
  revocationContract = new ethers.Contract(revocationAddress, CredentialRevocationABI, signer);
}
if (trustRegistryAddress && signer) {
  trustRegistryContract = new ethers.Contract(trustRegistryAddress, IssuerTrustRegistryABI, signer);
}

module.exports = {
  provider,
  signer,
  registryContract,
  revocationContract,
  trustRegistryContract,
  registryAddress,
  revocationAddress,
  trustRegistryAddress,
};
