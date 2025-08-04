import { expect } from "chai";
import { ethers } from "hardhat";
import { parseUnits, ZeroAddress } from "ethers";

describe("MockERC20", function () {
  let MockERC20: any;
  let mockToken: any;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any[];

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy MockERC20
    MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy("Mock USDC", "mUSDC", 6);
  });

  describe("Deployment", function () {
    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await mockToken.balanceOf(await owner.getAddress());
      expect(await mockToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct name and symbol", async function () {
      expect(await mockToken.name()).to.equal("Mock USDC");
      expect(await mockToken.symbol()).to.equal("mUSDC");
    });

    it("Should have correct decimals", async function () {
      expect(await mockToken.decimals()).to.equal(6);
    });
  });

  describe("Minting", function () {
    it("Should mint tokens to specified address", async function () {
      const mintAmount = parseUnits("1000", 6);
      const addr1Address = await addr1.getAddress();

      await mockToken.mint(addr1Address, mintAmount);

      expect(await mockToken.balanceOf(addr1Address)).to.equal(mintAmount);
    });

    it("Should increase total supply when minting", async function () {
      const initialSupply = await mockToken.totalSupply();
      const mintAmount = parseUnits("500", 6);

      await mockToken.mint(await addr1.getAddress(), mintAmount);

      expect(await mockToken.totalSupply()).to.equal(
        initialSupply + mintAmount
      );
    });

    it("Should emit Transfer event when minting", async function () {
      const mintAmount = parseUnits("1000", 6);
      const addr1Address = await addr1.getAddress();

      await expect(mockToken.mint(addr1Address, mintAmount))
        .to.emit(mockToken, "Transfer")
        .withArgs(ZeroAddress, addr1Address, mintAmount);
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Mint some tokens to addr1 for burning tests
      const mintAmount = parseUnits("1000", 6);
      await mockToken.mint(await addr1.getAddress(), mintAmount);
    });

    it("Should burn tokens from specified address", async function () {
      const burnAmount = parseUnits("500", 6);
      const addr1Address = await addr1.getAddress();
      const initialBalance = await mockToken.balanceOf(addr1Address);

      await mockToken.burn(addr1Address, burnAmount);

      expect(await mockToken.balanceOf(addr1Address)).to.equal(
        initialBalance - burnAmount
      );
    });

    it("Should decrease total supply when burning", async function () {
      const burnAmount = parseUnits("500", 6);
      const initialSupply = await mockToken.totalSupply();

      await mockToken.burn(await addr1.getAddress(), burnAmount);

      expect(await mockToken.totalSupply()).to.equal(
        initialSupply - burnAmount
      );
    });

    it("Should emit Transfer event when burning", async function () {
      const burnAmount = parseUnits("500", 6);
      const addr1Address = await addr1.getAddress();

      await expect(mockToken.burn(addr1Address, burnAmount))
        .to.emit(mockToken, "Transfer")
        .withArgs(addr1Address, ZeroAddress, burnAmount);
    });

    it("Should revert when trying to burn more than balance", async function () {
      const burnAmount = parseUnits("2000", 6); // More than minted

      await expect(mockToken.burn(await addr1.getAddress(), burnAmount)).to.be
        .reverted;
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      // Mint some tokens to addr1 for transfer tests
      const mintAmount = parseUnits("1000", 6);
      await mockToken.mint(await addr1.getAddress(), mintAmount);
    });

    it("Should transfer tokens between accounts", async function () {
      const transferAmount = parseUnits("100", 6);
      const addr1Address = await addr1.getAddress();
      const addr2Address = await addr2.getAddress();

      await mockToken.connect(addr1).transfer(addr2Address, transferAmount);

      expect(await mockToken.balanceOf(addr2Address)).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const transferAmount = parseUnits("2000", 6); // More than balance
      const addr2Address = await addr2.getAddress();

      await expect(
        mockToken.connect(addr1).transfer(addr2Address, transferAmount)
      ).to.be.reverted;
    });

    it("Should emit Transfer event", async function () {
      const transferAmount = parseUnits("100", 6);
      const addr1Address = await addr1.getAddress();
      const addr2Address = await addr2.getAddress();

      await expect(
        mockToken.connect(addr1).transfer(addr2Address, transferAmount)
      )
        .to.emit(mockToken, "Transfer")
        .withArgs(addr1Address, addr2Address, transferAmount);
    });
  });

  describe("Allowances", function () {
    beforeEach(async function () {
      // Mint some tokens to addr1 for allowance tests
      const mintAmount = parseUnits("1000", 6);
      await mockToken.mint(await addr1.getAddress(), mintAmount);
    });

    it("Should approve and transferFrom correctly", async function () {
      const approveAmount = parseUnits("500", 6);
      const transferAmount = parseUnits("200", 6);
      const addr1Address = await addr1.getAddress();
      const addr2Address = await addr2.getAddress();

      // Approve addr2 to spend tokens from addr1
      await mockToken.connect(addr1).approve(addr2Address, approveAmount);

      // Transfer tokens using transferFrom
      await mockToken
        .connect(addr2)
        .transferFrom(addr1Address, addr2Address, transferAmount);

      expect(await mockToken.balanceOf(addr2Address)).to.equal(transferAmount);
      expect(await mockToken.allowance(addr1Address, addr2Address)).to.equal(
        approveAmount - transferAmount
      );
    });

    it("Should fail transferFrom if allowance is insufficient", async function () {
      const approveAmount = parseUnits("100", 6);
      const transferAmount = parseUnits("200", 6); // More than approved
      const addr1Address = await addr1.getAddress();
      const addr2Address = await addr2.getAddress();

      await mockToken.connect(addr1).approve(addr2Address, approveAmount);

      await expect(
        mockToken
          .connect(addr2)
          .transferFrom(addr1Address, addr2Address, transferAmount)
      ).to.be.reverted;
    });
  });
});
