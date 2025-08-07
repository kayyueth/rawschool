import { ethers } from "ethers";

// Contract ABI for the BookClubStaking contract
const BOOK_CLUB_STAKING_ABI = [
  // Read functions
  "function getStakeInfo(address user) external view returns (uint256 stakedAmount, uint256 stakeTime, uint8 participation, bool refunded, uint256 eligibleRefund)",
  "function getContractStats() external view returns (uint256 totalStaked, uint256 totalRefunded, uint256 totalStakers, uint256 activeStakers)",
  "function stakes(address) public view returns (uint256 amount, uint256 timestamp, uint8 participation, bool refunded)",
  "function tokenBalance() public view returns (uint256)",
  "function owner() public view returns (address)",
  "function STAKE_AMOUNT() public view returns (uint256)",
  "function getAllStakers() external view returns (address[])",
  "function getStakersWithInfo() external view returns (address[], uint256[], uint8[], bool[])",
  "function isStaker(address) public view returns (bool)",

  // Write functions (regular users)
  "function stake() external",
  "function refund() external",

  // Write functions (owner only)
  "function setParticipation(address user, uint8 percentage) external",
  "function setMultipleParticipation(address[] users, uint8[] percentages) external",
  "function withdrawRemaining(address to) external",
  "function withdrawRemainingAmount(address to, uint256 amount) external",
  "function transferOwnership(address newOwner) external",
  "function emergencyUpdateStake(address user, uint256 amount, uint8 participation, bool refunded) external",

  // Events
  "event Staked(address indexed user, uint256 amount)",
  "event ParticipationSet(address indexed user, uint8 percentage)",
  "event Refunded(address indexed user, uint256 amount)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
];

// ERC20 ABI for token interactions
const ERC20_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
];

// Contract addresses (replace with actual deployed addresses)
export const BOOK_CLUB_STAKING_CONTRACT_ADDRESS =
  process.env.STAKING || "0x640E754A71Fc8018516D082719DbCe4330366135"; // Sepolia deployment
export const USDC_TOKEN_ADDRESS =
  process.env.MOCK_TOKEN || "0xd097EE2250428678065F610301D099D70E5C3F9B"; // Sepolia deployment

// Log contract addresses on module load
console.log("🔗 Staking Service - Contract Addresses:");
console.log("  📍 Staking Contract:", BOOK_CLUB_STAKING_CONTRACT_ADDRESS);
console.log("  🪙 Token Contract:", USDC_TOKEN_ADDRESS);
console.log("  🌐 Environment Variables:");
console.log("    - STAKING:", process.env.STAKING || "not set");
console.log("    - MOCK_TOKEN:", process.env.MOCK_TOKEN || "not set");

// Network configurations
const SUPPORTED_NETWORKS = {
  1: { name: "mainnet", chainId: 1 },
  5: { name: "goerli", chainId: 5 },
  11155111: { name: "sepolia", chainId: 11155111 },
  137: { name: "polygon", chainId: 137 },
  80001: { name: "mumbai", chainId: 80001 },
  56: { name: "bsc", chainId: 56 },
  97: { name: "bsc-testnet", chainId: 97 },
  43114: { name: "avalanche", chainId: 43114 },
  43113: { name: "fuji", chainId: 43113 },
  1337: { name: "localhost", chainId: 1337 },
  31337: { name: "hardhat", chainId: 31337 },
};

export interface BookClubStakeInfo {
  stakedAmount: string;
  stakeTime: number;
  participation: number; // 0-100
  refunded: boolean;
  eligibleRefund: string;
  isStaked: boolean;
}

export interface BookClubContractStats {
  totalStaked: string;
  totalRefunded: string;
  totalStakers: number;
  activeStakers: number;
  contractBalance: string;
}

export interface StakerInfo {
  address: string;
  amount: string;
  participation: number;
  refunded: boolean;
}

// Legacy interfaces for backward compatibility
export interface StakeInfo extends BookClubStakeInfo {
  pendingRewards: string;
  accumulatedRewards: string;
}

export interface ContractStats extends BookClubContractStats {
  totalRewardsDistributed: string;
}

class BookClubStakingService {
  private stakingContract: ethers.Contract | null = null;
  private tokenContract: ethers.Contract | null = null;
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private isInitialized = false;
  private tokenDecimals = 6; // USDC has 6 decimals

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        console.warn("Not in browser environment, skipping initialization");
        return;
      }

      // Check if MetaMask is available
      if (!window.ethereum) {
        console.warn(
          "MetaMask not detected. Please install MetaMask to use this feature."
        );
        return;
      }

      // Initialize the provider
      this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");

      // Request account access if needed
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.warn("User rejected account access:", error);
        // Don't throw here, just continue without signer
      }

      // Check if provider is available before getting network
      if (!this.provider) {
        console.warn("Provider not initialized");
        return;
      }

      const network = await this.provider.getNetwork();
      console.log("Connected to network:", network);

      if (
        !SUPPORTED_NETWORKS[network.chainId as keyof typeof SUPPORTED_NETWORKS]
      ) {
        console.warn(`Network ${network.chainId} may not be fully supported`);
      }

      // Get signer only if provider is available
      if (this.provider) {
        this.signer = this.provider.getSigner();
      }

      // Check if contract addresses are properly configured
      // Use the fallback addresses from .env file
      const stakingAddress = BOOK_CLUB_STAKING_CONTRACT_ADDRESS;
      const tokenAddress = USDC_TOKEN_ADDRESS;

      console.log("🔍 Initializing contracts with addresses:");
      console.log("  📍 Staking Address:", stakingAddress);
      console.log("  🪙 Token Address:", tokenAddress);

      if (
        stakingAddress === "0x0000000000000000000000000000000000000000" ||
        tokenAddress === "0x0000000000000000000000000000000000000000"
      ) {
        console.warn(
          "Contract addresses not configured. Using fallback addresses."
        );
        console.warn("STAKING:", stakingAddress);
        console.warn("MOCK_TOKEN:", tokenAddress);
        // Don't throw error, just log warning and continue
      }

      // Check if contracts exist at the specified addresses with better error handling
      if (this.provider) {
        try {
          const stakingCode = await this.provider.getCode(stakingAddress);
          const tokenCode = await this.provider.getCode(tokenAddress);

          if (stakingCode === "0x") {
            console.warn(
              `Staking contract not found at address ${stakingAddress}. This might be because:`
            );
            console.warn("1. Contract is not deployed to this network");
            console.warn("2. Address is incorrect");
            console.warn("3. You're connected to the wrong network");
            console.warn(
              "Expected network: Sepolia (Chain ID: 11155111) or Hardhat (Chain ID: 31337)"
            );
            console.warn("Current network:", network);
          }

          if (tokenCode === "0x") {
            console.warn(
              `Token contract not found at address ${tokenAddress}. This might be because:`
            );
            console.warn("1. Contract is not deployed to this network");
            console.warn("2. Address is incorrect");
            console.warn("3. You're connected to the wrong network");
            console.warn(
              "Expected network: Sepolia (Chain ID: 11155111) or Hardhat (Chain ID: 31337)"
            );
            console.warn("Current network:", network);
          }
        } catch (error) {
          console.warn("Error checking contract existence:", error);
        }
      }

      // Still create contracts even if they might not be deployed
      // This allows the service to work for testing purposes
      if (this.signer) {
        console.log("🏗️ Creating contract instances...");

        this.stakingContract = new ethers.Contract(
          stakingAddress,
          BOOK_CLUB_STAKING_ABI,
          this.signer
        );
        console.log("✅ Staking contract instance created");

        this.tokenContract = new ethers.Contract(
          tokenAddress,
          ERC20_ABI,
          this.signer
        );
        console.log("✅ Token contract instance created");

        // Get token decimals with error handling
        try {
          this.tokenDecimals = await this.tokenContract.decimals();
          console.log("📊 Token decimals:", this.tokenDecimals);
        } catch (error) {
          console.warn(
            "Failed to get token decimals, using default (6):",
            error
          );
          this.tokenDecimals = 6; // Default for USDC
        }
      }

      this.isInitialized = true;
      console.log("BookClubStakingService initialized successfully");
    } catch (error) {
      console.error("Failed to initialize book club staking service:", error);
      // Don't throw, just log the error
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private formatTokenAmount(amount: ethers.BigNumber): string {
    return ethers.utils.formatUnits(amount, this.tokenDecimals);
  }

  private parseTokenAmount(amount: string): ethers.BigNumber {
    return ethers.utils.parseUnits(amount, this.tokenDecimals);
  }

  async getBookClubStakeInfo(userAddress: string): Promise<BookClubStakeInfo> {
    try {
      console.log("🔍 Getting stake info for user:", userAddress);
      console.log(
        "📍 Using staking contract at:",
        BOOK_CLUB_STAKING_CONTRACT_ADDRESS
      );

      await this.ensureInitialized();

      if (!this.stakingContract) {
        console.error("❌ Staking contract not initialized");
        throw new Error("Staking contract not initialized");
      }

      // Check if contract is deployed
      if (!this.provider) {
        console.error("❌ Provider not initialized");
        throw new Error("Provider not initialized");
      }

      const code = await this.provider.getCode(
        BOOK_CLUB_STAKING_CONTRACT_ADDRESS
      );
      console.log("🔍 Contract code exists:", code !== "0x");

      if (code === "0x") {
        console.warn(
          "⚠️ Staking contract not deployed, returning default values"
        );
        return {
          stakedAmount: "0",
          stakeTime: 0,
          participation: 0,
          refunded: false,
          eligibleRefund: "0",
          isStaked: false,
        };
      }

      console.log("📞 Calling getStakeInfo on contract...");
      const result = await this.stakingContract.getStakeInfo(userAddress);
      console.log("✅ Stake info retrieved successfully");

      return {
        stakedAmount: this.formatTokenAmount(result.stakedAmount),
        stakeTime: result.stakeTime.toNumber(),
        participation: result.participation,
        refunded: result.refunded,
        eligibleRefund: this.formatTokenAmount(result.eligibleRefund),
        isStaked: result.stakedAmount.gt(0),
      };
    } catch (error) {
      console.error("❌ Error fetching book club stake info:", error);
      // Return default values instead of throwing
      return {
        stakedAmount: "0",
        stakeTime: 0,
        participation: 0,
        refunded: false,
        eligibleRefund: "0",
        isStaked: false,
      };
    }
  }

  // Legacy method for backward compatibility
  async getStakeInfo(userAddress: string): Promise<StakeInfo> {
    const bookClubInfo = await this.getBookClubStakeInfo(userAddress);
    return {
      ...bookClubInfo,
      pendingRewards: "0", // No pending rewards in book club model
      accumulatedRewards: "0", // No accumulated rewards in book club model
    };
  }

  async getBookClubContractStats(): Promise<BookClubContractStats> {
    try {
      console.log("📊 Getting contract stats...");
      console.log(
        "📍 Using staking contract at:",
        BOOK_CLUB_STAKING_CONTRACT_ADDRESS
      );

      await this.ensureInitialized();

      if (!this.stakingContract) {
        console.error("❌ Staking contract not initialized");
        throw new Error("Staking contract not initialized");
      }

      // Check if contract is deployed
      if (!this.provider) {
        console.error("❌ Provider not initialized");
        throw new Error("Provider not initialized");
      }

      const code = await this.provider.getCode(
        BOOK_CLUB_STAKING_CONTRACT_ADDRESS
      );
      console.log("🔍 Contract code exists:", code !== "0x");

      if (code === "0x") {
        console.warn(
          "⚠️ Staking contract not deployed, returning default values"
        );
        return {
          totalStaked: "0",
          totalRefunded: "0",
          totalStakers: 0,
          activeStakers: 0,
          contractBalance: "0",
        };
      }

      console.log(
        "📞 Calling getContractStats and tokenBalance on contract..."
      );
      const [statsResult, contractBalance] = await Promise.all([
        this.stakingContract.getContractStats(),
        this.stakingContract.tokenBalance(),
      ]);
      console.log("✅ Contract stats retrieved successfully");

      return {
        totalStaked: this.formatTokenAmount(statsResult.totalStaked),
        totalRefunded: this.formatTokenAmount(statsResult.totalRefunded),
        totalStakers: statsResult.totalStakers.toNumber(),
        activeStakers: statsResult.activeStakers.toNumber(),
        contractBalance: this.formatTokenAmount(contractBalance),
      };
    } catch (error) {
      console.error("❌ Error fetching contract stats:", error);
      // Return default values instead of throwing
      return {
        totalStaked: "0",
        totalRefunded: "0",
        totalStakers: 0,
        activeStakers: 0,
        contractBalance: "0",
      };
    }
  }

  // Legacy method for backward compatibility
  async getContractStats(): Promise<ContractStats> {
    const bookClubStats = await this.getBookClubContractStats();
    return {
      ...bookClubStats,
      totalRewardsDistributed: bookClubStats.totalRefunded, // Map refunded to rewards distributed
    };
  }

  async getUserTokenBalance(userAddress: string): Promise<string> {
    try {
      console.log("💰 Getting token balance for user:", userAddress);
      console.log("🪙 Using token contract at:", USDC_TOKEN_ADDRESS);

      await this.ensureInitialized();

      if (!this.tokenContract) {
        console.error("❌ Token contract not initialized");
        throw new Error("Token contract not initialized");
      }

      console.log("📞 Calling balanceOf on token contract...");
      const balance = await this.tokenContract.balanceOf(userAddress);
      console.log(
        "✅ Token balance retrieved:",
        this.formatTokenAmount(balance)
      );

      return this.formatTokenAmount(balance);
    } catch (error) {
      console.error("❌ Error fetching token balance:", error);
      throw this.handleContractError(error);
    }
  }

  async checkTokenAllowance(userAddress: string): Promise<string> {
    try {
      console.log("🔐 Checking token allowance for user:", userAddress);
      console.log("🪙 Using token contract at:", USDC_TOKEN_ADDRESS);
      console.log(
        "📍 Checking allowance for staking contract:",
        BOOK_CLUB_STAKING_CONTRACT_ADDRESS
      );

      await this.ensureInitialized();

      if (!this.tokenContract) {
        console.error("❌ Token contract not initialized");
        throw new Error("Token contract not initialized");
      }

      console.log("📞 Calling allowance on token contract...");
      const allowance = await this.tokenContract.allowance(
        userAddress,
        BOOK_CLUB_STAKING_CONTRACT_ADDRESS
      );
      console.log(
        "✅ Token allowance retrieved:",
        this.formatTokenAmount(allowance)
      );

      return this.formatTokenAmount(allowance);
    } catch (error) {
      console.error("❌ Error checking allowance:", error);
      throw this.handleContractError(error);
    }
  }

  async getStakeAmount(): Promise<string> {
    try {
      await this.ensureInitialized();

      if (!this.stakingContract) {
        throw new Error("Staking contract not initialized");
      }

      const stakeAmount = await this.stakingContract.STAKE_AMOUNT();
      return this.formatTokenAmount(stakeAmount);
    } catch (error) {
      console.error("Error fetching stake amount:", error);
      throw this.handleContractError(error);
    }
  }

  async approveTokens(): Promise<ethers.ContractTransaction> {
    try {
      await this.ensureInitialized();

      if (!this.tokenContract || !this.stakingContract) {
        throw new Error("Contracts not initialized");
      }

      const stakeAmount = await this.stakingContract.STAKE_AMOUNT();
      const tx = await this.tokenContract.approve(
        BOOK_CLUB_STAKING_CONTRACT_ADDRESS,
        stakeAmount
      );
      return tx;
    } catch (error) {
      console.error("Error approving tokens:", error);
      throw this.handleContractError(error);
    }
  }

  async stake(): Promise<ethers.ContractTransaction> {
    try {
      await this.ensureInitialized();

      if (!this.stakingContract) {
        throw new Error("Staking contract not initialized");
      }

      const tx = await this.stakingContract.stake();
      return tx;
    } catch (error) {
      console.error("Error staking tokens:", error);
      throw this.handleContractError(error);
    }
  }

  async refund(): Promise<ethers.ContractTransaction> {
    try {
      await this.ensureInitialized();

      if (!this.stakingContract) {
        throw new Error("Staking contract not initialized");
      }

      const tx = await this.stakingContract.refund();
      return tx;
    } catch (error) {
      console.error("Error claiming refund:", error);
      throw this.handleContractError(error);
    }
  }

  // Admin functions
  async isOwner(userAddress: string): Promise<boolean> {
    try {
      await this.ensureInitialized();

      if (!this.stakingContract) {
        throw new Error("Staking contract not initialized");
      }

      const owner = await this.stakingContract.owner();
      return owner.toLowerCase() === userAddress.toLowerCase();
    } catch (error) {
      console.error("Error checking ownership:", error);
      return false;
    }
  }

  async setParticipation(
    userAddress: string,
    percentage: number
  ): Promise<ethers.ContractTransaction> {
    try {
      await this.ensureInitialized();

      if (!this.stakingContract) {
        throw new Error("Staking contract not initialized");
      }

      const tx = await this.stakingContract.setParticipation(
        userAddress,
        percentage
      );
      return tx;
    } catch (error) {
      console.error("Error setting participation:", error);
      throw this.handleContractError(error);
    }
  }

  async setMultipleParticipation(
    userAddresses: string[],
    percentages: number[]
  ): Promise<ethers.ContractTransaction> {
    try {
      await this.ensureInitialized();

      if (!this.stakingContract) {
        throw new Error("Staking contract not initialized");
      }

      const tx = await this.stakingContract.setMultipleParticipation(
        userAddresses,
        percentages
      );
      return tx;
    } catch (error) {
      console.error("Error setting multiple participations:", error);
      throw this.handleContractError(error);
    }
  }

  async getAllStakers(): Promise<StakerInfo[]> {
    try {
      await this.ensureInitialized();

      if (!this.stakingContract) {
        throw new Error("Staking contract not initialized");
      }

      const result = await this.stakingContract.getStakersWithInfo();
      const [addresses, amounts, participations, refundedStatus] = result;

      return addresses.map((address: string, index: number) => ({
        address,
        amount: this.formatTokenAmount(amounts[index]),
        participation: participations[index],
        refunded: refundedStatus[index],
      }));
    } catch (error) {
      console.error("Error fetching all stakers:", error);
      throw this.handleContractError(error);
    }
  }

  async withdrawRemaining(
    toAddress: string
  ): Promise<ethers.ContractTransaction> {
    try {
      await this.ensureInitialized();

      if (!this.stakingContract) {
        throw new Error("Staking contract not initialized");
      }

      const tx = await this.stakingContract.withdrawRemaining(toAddress);
      return tx;
    } catch (error) {
      console.error("Error withdrawing remaining funds:", error);
      throw this.handleContractError(error);
    }
  }

  async getTokenInfo(): Promise<{
    symbol: string;
    name: string;
    decimals: number;
  }> {
    try {
      await this.ensureInitialized();

      if (!this.tokenContract) {
        throw new Error("Token contract not initialized");
      }

      // Check if contract exists before calling methods
      if (!this.provider) {
        throw new Error("Provider not initialized");
      }

      const code = await this.provider.getCode(USDC_TOKEN_ADDRESS);
      if (code === "0x") {
        console.warn("Token contract not found at specified address");
        // Return default values for testing
        return {
          symbol: "mUSDC",
          name: "Mock USDC",
          decimals: 6,
        };
      }

      const [symbol, name, decimals] = await Promise.all([
        this.tokenContract.symbol().catch(() => "mUSDC"),
        this.tokenContract.name().catch(() => "Mock USDC"),
        this.tokenContract.decimals().catch(() => 6),
      ]);

      return { symbol, name, decimals };
    } catch (error) {
      console.error("Error fetching token info:", error);
      // Return default values instead of throwing
      return {
        symbol: "mUSDC",
        name: "Mock USDC",
        decimals: 6,
      };
    }
  }

  // Legacy methods for backward compatibility
  async unstake(_amount: string): Promise<ethers.ContractTransaction> {
    throw new Error(
      "Unstaking is not available in book club model. Use refund() instead."
    );
  }

  async claimRewards(): Promise<ethers.ContractTransaction> {
    return this.refund();
  }

  async getTotalRewards(userAddress: string): Promise<string> {
    const stakeInfo = await this.getBookClubStakeInfo(userAddress);
    return stakeInfo.eligibleRefund;
  }

  private handleContractError(error: any): Error {
    if (error.code === "UNSUPPORTED_OPERATION") {
      return new Error(
        "Network not supported. Please switch to a supported network."
      );
    }

    if (error.code === "NETWORK_ERROR") {
      return new Error(
        "Network connection error. Please check your internet connection."
      );
    }

    if (error.code === "CALL_EXCEPTION") {
      return new Error(
        "Contract call failed. Please check if contracts are deployed on this network."
      );
    }

    if (error.reason) {
      return new Error(error.reason);
    }

    if (error.message) {
      return new Error(error.message);
    }

    return new Error("An unknown error occurred. Please try again.");
  }

  async getCurrentNetwork(): Promise<{ chainId: number; name: string } | null> {
    try {
      console.log("🌐 Getting current network info...");

      await this.ensureInitialized();

      if (!this.provider) {
        console.warn("⚠️ Provider not initialized, cannot get network info");
        return null;
      }

      const network = await this.provider.getNetwork();
      console.log("🔍 Detected network:", network);

      const supportedNetwork =
        SUPPORTED_NETWORKS[network.chainId as keyof typeof SUPPORTED_NETWORKS];

      const networkInfo = {
        chainId: network.chainId,
        name: supportedNetwork ? supportedNetwork.name : "Unknown Network",
      };

      console.log("✅ Network info:", networkInfo);
      return networkInfo;
    } catch (error) {
      console.error("❌ Error getting current network:", error);
      return null;
    }
  }

  reset() {
    this.isInitialized = false;
    this.stakingContract = null;
    this.tokenContract = null;
    this.provider = null;
    this.signer = null;
    this.tokenDecimals = 6; // Reset to USDC default
  }
}

export const stakingService = new BookClubStakingService();
