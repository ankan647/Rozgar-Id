const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying RozgarID contracts to", hre.network.name, "...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // --- Deploy RozgarIDRegistry ---
  console.log("📝 Deploying RozgarIDRegistry...");
  const RozgarIDRegistry = await hre.ethers.getContractFactory("RozgarIDRegistry");
  const registry = await RozgarIDRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ RozgarIDRegistry deployed to:", registryAddress);

  // --- Deploy CredentialRevocation ---
  console.log("\n📝 Deploying CredentialRevocation...");
  const CredentialRevocation = await hre.ethers.getContractFactory("CredentialRevocation");
  const revocation = await CredentialRevocation.deploy();
  await revocation.waitForDeployment();
  const revocationAddress = await revocation.getAddress();
  console.log("✅ CredentialRevocation deployed to:", revocationAddress);

  // IssuerTrustRegistry skipped — backend handles missing contract gracefully

  // --- Save deployed addresses ---
  const deployedContracts = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 80002,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      RozgarIDRegistry: registryAddress,
      CredentialRevocation: revocationAddress,
    },
  };

  const outputPath = path.join(__dirname, "..", "deployedContracts.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployedContracts, null, 2));
  console.log("\n📄 Contract addresses saved to deployedContracts.json");

  // Also copy to backend config directory if it exists
  const backendConfigPath = path.join(__dirname, "..", "..", "backend", "src", "config", "deployedContracts.json");
  const backendConfigDir = path.dirname(backendConfigPath);
  if (fs.existsSync(backendConfigDir)) {
    fs.writeFileSync(backendConfigPath, JSON.stringify(deployedContracts, null, 2));
    console.log("📄 Contract addresses also saved to backend/src/config/deployedContracts.json");
  }

  console.log("\n🎉 Contracts deployed successfully!");
  console.log("───────────────────────────────────────");
  console.log("RozgarIDRegistry:    ", registryAddress);
  console.log("CredentialRevocation:", revocationAddress);
  console.log("───────────────────────────────────────");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
