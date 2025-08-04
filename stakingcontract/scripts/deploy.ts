import { ethers } from "hardhat";
import { parseUnits, formatUnits } from "ethers";

async function main() {
  console.log("Deploying contracts...");

  // Deploy MockERC20 first
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20.deploy("Mock USDC", "mUSDC", 6);
  await mockToken.waitForDeployment();
  console.log("MockERC20 deployed to:", await mockToken.getAddress());

  // Deploy BookClubStaking with the mock token
  const BookClubStaking = await ethers.getContractFactory("BookClubStaking");
  const staking = await BookClubStaking.deploy(await mockToken.getAddress());
  await staking.waitForDeployment();
  console.log("BookClubStaking deployed to:", await staking.getAddress());

  // Mint some tokens to the deployer for testing
  const [deployer] = await ethers.getSigners();
  const mintAmount = parseUnits("10000", 6); // 10,000 USDC
  await mockToken.mint(await deployer.getAddress(), mintAmount);
  console.log(`Minted ${formatUnits(mintAmount, 6)} tokens to deployer`);

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("MockERC20:", await mockToken.getAddress());
  console.log("BookClubStaking:", await staking.getAddress());
  console.log("Deployer:", await deployer.getAddress());
  console.log("Stake Amount: 100 USDC");
  console.log("Token Decimals: 6");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
