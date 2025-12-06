const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FileStamp contract to Polygon Amoy Testnet...");

  // Get the contract factory
  const FileStamp = await hre.ethers.getContractFactory("FileStamp");

  // Deploy the contract
  console.log("⏳ Deploying...");
  const fileStamp = await FileStamp.deploy();

  // Wait for deployment
  await fileStamp.waitForDeployment();

  const address = await fileStamp.getAddress();
  console.log("✅ FileStamp deployed to:", address);
  console.log("📋 Contract address:", address);
  console.log("\n🔗 View on PolygonScan:");
  console.log(`https://amoy.polygonscan.com/address/${address}\n`);

  // Save to a file for easy reference
  const fs = require("fs");
  const deploymentInfo = {
    network: "amoy",
    contractAddress: address,
    deployer: (await hre.ethers.provider.getSigner()).address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment.json");
  console.log("\n⚠️  IMPORTANT: Copy the contract address to your backend .env file:");
  console.log(`CONTRACT_ADDRESS=${address}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

