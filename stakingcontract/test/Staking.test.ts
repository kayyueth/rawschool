import { expect } from "chai";
import { ethers } from "hardhat";
import { parseUnits, ZeroAddress } from "ethers";

describe("BookClubStaking", function () {
  let MockERC20: any;
  let BookClubStaking: any;
  let mockToken: any;
  let staking: any;
  let owner: any;
  let user1: any;
  let user2: any;
  let user3: any;
  let addrs: any[];

  const STAKE_AMOUNT = parseUnits("100", 6); // 100 USDC

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, user3, ...addrs] = await ethers.getSigners();

    // Deploy MockERC20
    MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy("Mock USDC", "mUSDC", 6);

    // Wait for deployment to complete
    await mockToken.waitForDeployment();
    const mockTokenAddress = await mockToken.getAddress();

    // Deploy BookClubStaking
    BookClubStaking = await ethers.getContractFactory("BookClubStaking");
    staking = await BookClubStaking.deploy(mockTokenAddress);
    await staking.waitForDeployment();

    // Mint tokens to users for testing
    const mintAmount = parseUnits("1000", 6);
    await mockToken.mint(await user1.getAddress(), mintAmount);
    await mockToken.mint(await user2.getAddress(), mintAmount);
    await mockToken.mint(await user3.getAddress(), mintAmount);
  });

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      const mockTokenAddress = await mockToken.getAddress();
      expect(await staking.token()).to.equal(mockTokenAddress);
    });

    it("Should set the correct owner", async function () {
      expect(await staking.owner()).to.equal(await owner.getAddress());
    });

    it("Should have the correct stake amount", async function () {
      expect(await staking.STAKE_AMOUNT()).to.equal(STAKE_AMOUNT);
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      // Approve tokens for staking
      const stakingAddress = await staking.getAddress();
      await mockToken.connect(user1).approve(stakingAddress, STAKE_AMOUNT);
      await mockToken.connect(user2).approve(stakingAddress, STAKE_AMOUNT);
    });

    it("Should allow users to stake tokens", async function () {
      const user1Address = await user1.getAddress();
      const initialBalance = await mockToken.balanceOf(user1Address);
      const stakingAddress = await staking.getAddress();

      await staking.connect(user1).stake();

      expect(await mockToken.balanceOf(user1Address)).to.equal(
        initialBalance - STAKE_AMOUNT
      );
      expect(await mockToken.balanceOf(stakingAddress)).to.equal(STAKE_AMOUNT);
    });

    it("Should emit Staked event", async function () {
      const user1Address = await user1.getAddress();

      await expect(staking.connect(user1).stake())
        .to.emit(staking, "Staked")
        .withArgs(user1Address, STAKE_AMOUNT);
    });

    it("Should prevent double staking", async function () {
      await staking.connect(user1).stake();

      await expect(staking.connect(user1).stake()).to.be.revertedWith(
        "Already staked"
      );
    });

    it("Should fail if user doesn't have enough tokens", async function () {
      const poorUser = addrs[0];
      await mockToken.mint(await poorUser.getAddress(), parseUnits("50", 6));
      const stakingAddress = await staking.getAddress();
      await mockToken.connect(poorUser).approve(stakingAddress, STAKE_AMOUNT);

      await expect(staking.connect(poorUser).stake()).to.be.reverted;
    });

    it("Should fail if not approved", async function () {
      await expect(staking.connect(user3).stake()).to.be.reverted;
    });
  });

  describe("Participation Management", function () {
    beforeEach(async function () {
      // Setup staking
      const stakingAddress = await staking.getAddress();
      await mockToken.connect(user1).approve(stakingAddress, STAKE_AMOUNT);
      await mockToken.connect(user2).approve(stakingAddress, STAKE_AMOUNT);
      await staking.connect(user1).stake();
      await staking.connect(user2).stake();
    });

    it("Should allow owner to set participation", async function () {
      const user1Address = await user1.getAddress();

      await staking.connect(owner).setParticipation(user1Address, 75);

      const stakeInfo = await staking.getStakeInfo(user1Address);
      expect(stakeInfo.participation).to.equal(75);
    });

    it("Should emit ParticipationSet event", async function () {
      const user1Address = await user1.getAddress();

      await expect(staking.connect(owner).setParticipation(user1Address, 80))
        .to.emit(staking, "ParticipationSet")
        .withArgs(user1Address, 80);
    });

    it("Should prevent non-owner from setting participation", async function () {
      const user1Address = await user1.getAddress();

      await expect(
        staking.connect(user1).setParticipation(user1Address, 50)
      ).to.be.revertedWith("Not admin");
    });

    it("Should prevent setting participation > 100%", async function () {
      const user1Address = await user1.getAddress();

      await expect(
        staking.connect(owner).setParticipation(user1Address, 101)
      ).to.be.revertedWith("Max 100%");
    });

    it("Should prevent setting participation for non-staker", async function () {
      const nonStaker = await user3.getAddress();

      await expect(
        staking.connect(owner).setParticipation(nonStaker, 50)
      ).to.be.revertedWith("User not staked");
    });

    it("Should allow setting multiple participations", async function () {
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();

      await staking
        .connect(owner)
        .setMultipleParticipation([user1Address, user2Address], [75, 90]);

      const stakeInfo1 = await staking.getStakeInfo(user1Address);
      const stakeInfo2 = await staking.getStakeInfo(user2Address);

      expect(stakeInfo1.participation).to.equal(75);
      expect(stakeInfo2.participation).to.equal(90);
    });
  });

  describe("Refunds", function () {
    beforeEach(async function () {
      // Setup staking and participation
      const stakingAddress = await staking.getAddress();
      await mockToken.connect(user1).approve(stakingAddress, STAKE_AMOUNT);
      await staking.connect(user1).stake();
      await staking
        .connect(owner)
        .setParticipation(await user1.getAddress(), 80);
    });

    it("Should allow users to claim refunds", async function () {
      const user1Address = await user1.getAddress();
      const initialBalance = await mockToken.balanceOf(user1Address);
      const expectedRefund = (STAKE_AMOUNT * 80n) / 100n; // 80% of stake

      await staking.connect(user1).refund();

      expect(await mockToken.balanceOf(user1Address)).to.equal(
        initialBalance + expectedRefund
      );
    });

    it("Should emit Refunded event", async function () {
      const user1Address = await user1.getAddress();
      const expectedRefund = (STAKE_AMOUNT * 80n) / 100n;

      await expect(staking.connect(user1).refund())
        .to.emit(staking, "Refunded")
        .withArgs(user1Address, expectedRefund);
    });

    it("Should prevent double refunds", async function () {
      await staking.connect(user1).refund();

      await expect(staking.connect(user1).refund()).to.be.revertedWith(
        "Already refunded"
      );
    });

    it("Should prevent refund without participation", async function () {
      // User2 stakes but no participation set
      const stakingAddress = await staking.getAddress();
      await mockToken.connect(user2).approve(stakingAddress, STAKE_AMOUNT);
      await staking.connect(user2).stake();

      await expect(staking.connect(user2).refund()).to.be.revertedWith(
        "Not eligible yet"
      );
    });

    it("Should prevent refund without stake", async function () {
      await expect(staking.connect(user3).refund()).to.be.revertedWith(
        "No stake"
      );
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      // Setup multiple stakers
      const stakingAddress = await staking.getAddress();
      await mockToken.connect(user1).approve(stakingAddress, STAKE_AMOUNT);
      await mockToken.connect(user2).approve(stakingAddress, STAKE_AMOUNT);
      await staking.connect(user1).stake();
      await staking.connect(user2).stake();
    });

    it("Should return correct stake info", async function () {
      const user1Address = await user1.getAddress();
      const stakeInfo = await staking.getStakeInfo(user1Address);

      expect(stakeInfo.stakedAmount).to.equal(STAKE_AMOUNT);
      expect(stakeInfo.participation).to.equal(0);
      expect(stakeInfo.refunded).to.equal(false);
      expect(stakeInfo.eligibleRefund).to.equal(0);
    });

    it("Should return correct contract stats", async function () {
      const stats = await staking.getContractStats();

      expect(stats.totalStaked).to.equal(STAKE_AMOUNT * 2n);
      expect(stats.totalStakers).to.equal(2);
      expect(stats.activeStakers).to.equal(2);
    });

    it("Should return all stakers", async function () {
      const stakers = await staking.getAllStakers();
      expect(stakers.length).to.equal(2);
    });

    it("Should return stakers with info", async function () {
      const result = await staking.getStakersWithInfo();
      const [addresses, amounts, participations, refundedStatus] = result;

      expect(addresses.length).to.equal(2);
      expect(amounts.length).to.equal(2);
      expect(participations.length).to.equal(2);
      expect(refundedStatus.length).to.equal(2);
    });
  });

  describe("Admin Functions", function () {
    beforeEach(async function () {
      // Setup staking
      const stakingAddress = await staking.getAddress();
      await mockToken.connect(user1).approve(stakingAddress, STAKE_AMOUNT);
      await staking.connect(user1).stake();
    });

    it("Should allow owner to withdraw remaining funds", async function () {
      const ownerAddress = await owner.getAddress();
      const initialBalance = await mockToken.balanceOf(ownerAddress);

      await staking.connect(owner).withdrawRemaining(ownerAddress);

      expect(await mockToken.balanceOf(ownerAddress)).to.equal(
        initialBalance + STAKE_AMOUNT
      );
    });

    it("Should prevent non-owner from withdrawing", async function () {
      await expect(
        staking.connect(user1).withdrawRemaining(await user1.getAddress())
      ).to.be.revertedWith("Not admin");
    });

    it("Should allow owner to transfer ownership", async function () {
      const newOwner = await user2.getAddress();

      await staking.connect(owner).transferOwnership(newOwner);

      expect(await staking.owner()).to.equal(newOwner);
    });

    it("Should emit OwnershipTransferred event", async function () {
      const newOwner = await user2.getAddress();
      const oldOwner = await owner.getAddress();

      await expect(staking.connect(owner).transferOwnership(newOwner))
        .to.emit(staking, "OwnershipTransferred")
        .withArgs(oldOwner, newOwner);
    });

    it("Should prevent transferring to zero address", async function () {
      await expect(
        staking.connect(owner).transferOwnership(ZeroAddress)
      ).to.be.revertedWith("New owner is the zero address");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero participation correctly", async function () {
      const stakingAddress = await staking.getAddress();
      await mockToken.connect(user1).approve(stakingAddress, STAKE_AMOUNT);
      await staking.connect(user1).stake();
      await staking
        .connect(owner)
        .setParticipation(await user1.getAddress(), 0);

      const stakeInfo = await staking.getStakeInfo(await user1.getAddress());
      expect(stakeInfo.eligibleRefund).to.equal(0);
    });

    it("Should handle 100% participation correctly", async function () {
      const stakingAddress = await staking.getAddress();
      await mockToken.connect(user1).approve(stakingAddress, STAKE_AMOUNT);
      await staking.connect(user1).stake();
      await staking
        .connect(owner)
        .setParticipation(await user1.getAddress(), 100);

      const stakeInfo = await staking.getStakeInfo(await user1.getAddress());
      expect(stakeInfo.eligibleRefund).to.equal(STAKE_AMOUNT);
    });

    it("Should handle multiple refunds correctly", async function () {
      // Setup multiple users with different participations
      const stakingAddress = await staking.getAddress();
      await mockToken.connect(user1).approve(stakingAddress, STAKE_AMOUNT);
      await mockToken.connect(user2).approve(stakingAddress, STAKE_AMOUNT);
      await staking.connect(user1).stake();
      await staking.connect(user2).stake();

      await staking
        .connect(owner)
        .setParticipation(await user1.getAddress(), 75);
      await staking
        .connect(owner)
        .setParticipation(await user2.getAddress(), 90);

      // Both users refund
      await staking.connect(user1).refund();
      await staking.connect(user2).refund();

      const stats = await staking.getContractStats();
      expect(stats.activeStakers).to.equal(0);
      expect(stats.totalRefunded).to.equal((STAKE_AMOUNT * 165n) / 100n); // 75% + 90%
    });
  });
});
