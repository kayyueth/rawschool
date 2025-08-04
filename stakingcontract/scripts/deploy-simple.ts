import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying contracts with:", deployer.address);

  // 部署 MockERC20 (USDC-like)
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const token = await MockERC20.deploy("Mock USDC", "mUSDC", 6);
  await token.waitForDeployment();
  console.log("✅ MockERC20 deployed at:", await token.getAddress());

  // 给自己打印 1000 个代币
  const mintAmount = ethers.parseUnits("1000", 6); // 6 decimals
  await token.mint(deployer.address, mintAmount);
  console.log("✅ Minted:", mintAmount.toString());

  // 部署 Staking 合约
  const Staking = await ethers.getContractFactory("BookClubStaking");
  const staking = await Staking.deploy(await token.getAddress());
  await staking.waitForDeployment();
  console.log("✅ Staking contract deployed at:", await staking.getAddress());

  // 授权 Staking 合约转账你的 token
  const approveTx = await token.approve(await staking.getAddress(), mintAmount);
  await approveTx.wait();
  console.log("✅ Approved staking contract");

  // 调用 stake()
  const stakeTx = await staking.stake();
  await stakeTx.wait();
  console.log("✅ Stake completed!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
