import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
dotenv.config({ path: "../.env" });

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

console.log("🧪 ENV URL:", process.env.SEPOLIA_URL);
console.log("🧪 ENV PRIVATE KEY:", process.env.PRIVATE_KEY);

export default config;
