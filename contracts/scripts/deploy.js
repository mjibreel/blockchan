const hre = require("hardhat");

// Network configurations with block explorer URLs
const NETWORK_CONFIG = {
  amoy: {
    name: "Polygon Amoy",
    explorer: "https://amoy.polygonscan.com",
  },
  baseSepolia: {
    name: "Base Sepolia",
    explorer: "https://sepolia.basescan.org",
  },
  ethereumSepolia: {
    name: "Ethereum Sepolia",
    explorer: "https://sepolia.etherscan.io",
  },
  arbitrumSepolia: {
    name: "Arbitrum Sepolia",
    explorer: "https://sepolia.arbiscan.io",
  },
};

async function main() {
  const networkName = hre.network.name;
  const networkConfig = NETWORK_CONFIG[networkName] || { name: networkName, explorer: "" };

  console.log(`🚀 Deploying FileStamp contract to ${networkConfig.name}...`);

  // Get the contract factory
  const FileStamp = await hre.ethers.getContractFactory("FileStamp");

  // Deploy the contract
  console.log("⏳ Deploying...");
  const fileStamp = await FileStamp.deploy();

  // Wait for deployment
  await fileStamp.waitForDeployment();

  const address = await fileStamp.getAddress();
  const deployer = (await hre.ethers.provider.getSigner()).address;
  
  console.log("✅ FileStamp deployed to:", address);
  console.log("📋 Contract address:", address);
  console.log("👤 Deployer address:", deployer);
  
  if (networkConfig.explorer) {
    console.log(`\n🔗 View on Block Explorer:`);
    console.log(`${networkConfig.explorer}/address/${address}\n`);
  }

  // Save to a file for easy reference
  const fs = require("fs");
  const deploymentInfo = {
    network: networkName,
    networkName: networkConfig.name,
    contractAddress: address,
    deployer: deployer,
    timestamp: new Date().toISOString(),
    explorer: networkConfig.explorer,
  };

  // Save individual deployment file
  fs.writeFileSync(
    `./deployment-${networkName}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Also update main deployment.json with latest
  fs.writeFileSync(
    "./deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`💾 Deployment info saved to deployment-${networkName}.json`);
  console.log("\n⚠️  IMPORTANT: Add this to your frontend .env file:");
  console.log(`REACT_APP_CONTRACT_ADDRESS_${networkName.toUpperCase().replace('SEPOLIA', '_SEPOLIA').replace('AMOY', '_POLYGON')}=${address}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

