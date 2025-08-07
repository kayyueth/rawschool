"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/lib/web3Context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Sparkles, Edit2, Coins, Users, Award } from "lucide-react";
import {
  fetchWalletBookclubReviews,
  fetchWalletAmbientCards,
} from "@/lib/services/userContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import {
  updateUsername,
  getUsernameByWalletAddress,
} from "@/lib/auth/userService";
import { Loading } from "@/components/ui/loading";
import {
  stakingService,
  StakeInfo,
  ContractStats,
  BookClubStakeInfo,
  BookClubContractStats,
  StakerInfo,
} from "@/lib/services/stakingService";

interface DisplayReview {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface DisplayCard {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function ProfileView() {
  const { account, isConnected, user } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [bookclubReviews, setBookclubReviews] = useState<DisplayReview[]>([]);
  const [ambientCards, setAmbientCards] = useState<DisplayCard[]>([]);
  const [username, setUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  // Staking related state
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
  const [contractStats, setContractStats] = useState<ContractStats | null>(
    null
  );
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [unstakeAmount, setUnstakeAmount] = useState<string>("");
  const [isStakingLoading, setIsStakingLoading] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<{
    chainId: number;
    name: string;
  } | null>(null);
  const [stakingError, setStakingError] = useState<string | null>(null);

  // Book club specific state
  const [fixedStakeAmount, setFixedStakeAmount] = useState<string>("100");
  const [customStakeAmount, setCustomStakeAmount] = useState<string>("100");
  const [tokenInfo, setTokenInfo] = useState<{
    symbol: string;
    name: string;
    decimals: number;
  } | null>(null);

  useEffect(() => {
    // 如果用户已连接钱包，则获取数据
    if (isConnected && account) {
      fetchUserData(account);
      fetchUserProfile(account);
      fetchStakingData(account);
    }
  }, [isConnected, account]);

  // Reset staking service when account changes
  useEffect(() => {
    if (account) {
      stakingService.reset();
    }
  }, [account]);

  const fetchStakingData = async (address: string) => {
    try {
      setIsStakingLoading(true);
      setStakingError(null);

      // Get network info first
      const network = await stakingService.getCurrentNetwork();
      setNetworkInfo(network);

      const [stakeInfo, contractStats, balance, stakeAmount, tokenInfo] =
        await Promise.all([
          stakingService.getStakeInfo(address),
          stakingService.getContractStats(),
          stakingService.getUserTokenBalance(address),
          stakingService.getStakeAmount(),
          stakingService.getTokenInfo(),
        ]);

      setStakeInfo(stakeInfo);
      setContractStats(contractStats);
      setTokenBalance(balance);
      setFixedStakeAmount(stakeAmount);
      setCustomStakeAmount(stakeAmount); // Set initial custom amount to contract's fixed amount
      setTokenInfo(tokenInfo);
    } catch (error: any) {
      console.error("Failed to fetch staking data:", error);
      setStakingError(error.message || "Failed to load staking data");

      // Set default values on error
      setStakeInfo(null);
      setContractStats(null);
      setTokenBalance("0");
    } finally {
      setIsStakingLoading(false);
    }
  };

  const handleStake = async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!stakeInfo || stakeInfo.isStaked) {
      toast.error("You have already staked");
      return;
    }

    const stakeAmount = parseFloat(customStakeAmount);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      toast.error("Please enter a valid deposit amount");
      return;
    }

    if (stakeAmount > parseFloat(tokenBalance)) {
      toast.error("Insufficient token balance");
      return;
    }

    try {
      setIsStakingLoading(true);

      // Check if approval is needed
      const allowance = await stakingService.checkTokenAllowance(account);
      if (parseFloat(allowance) < stakeAmount) {
        toast.loading("Approving tokens...");
        const approveTx = await stakingService.approveTokens();
        await approveTx.wait();
        toast.dismiss();
        toast.success("Tokens approved successfully");
      }

      // Stake the tokens
      toast.loading("Joining book club...");
      const stakeTx = await stakingService.stake();
      await stakeTx.wait();
      toast.dismiss();
      toast.success("Successfully joined the book club!");

      // Refresh data
      await fetchStakingData(account);
      setCustomStakeAmount(fixedStakeAmount); // Reset to default
    } catch (error: any) {
      console.error("Staking failed:", error);
      toast.dismiss();
      toast.error(
        error.message || "Failed to join book club. Please try again."
      );
    } finally {
      setIsStakingLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!account || !stakeInfo) {
      toast.error("No stake found");
      return;
    }

    if (!stakeInfo.isStaked) {
      toast.error("You haven't staked yet");
      return;
    }

    if (stakeInfo.refunded) {
      toast.error("You have already claimed your refund");
      return;
    }

    if (stakeInfo.participation === 0) {
      toast.error("Your participation hasn't been set yet");
      return;
    }

    try {
      setIsStakingLoading(true);
      toast.loading("Processing refund...");

      const refundTx = await stakingService.refund();
      await refundTx.wait();

      toast.dismiss();
      toast.success(
        `Refund of ${parseFloat(stakeInfo.eligibleRefund).toFixed(2)} ${
          tokenInfo?.symbol || "tokens"
        } claimed successfully!`
      );

      // Refresh data
      await fetchStakingData(account);
    } catch (error: any) {
      console.error("Refund failed:", error);
      toast.dismiss();
      toast.error(error.message || "Refund failed. Please try again.");
    } finally {
      setIsStakingLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    return handleRefund();
  };

  const fetchUserProfile = async (address: string) => {
    try {
      const username = await getUsernameByWalletAddress(address);

      if (username) {
        setUsername(username);
        setNewUsername(username);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const saveUsername = async () => {
    if (!user || !newUsername.trim()) return;

    try {
      const updatedUser = await updateUsername(user.id, newUsername);

      if (updatedUser) {
        setUsername(newUsername);
        setIsEditingUsername(false);
        toast.success("Username updated successfully");
      } else {
        toast.error("Failed to save username");
      }
    } catch (error) {
      console.error("Failed to save username:", error);
      toast.error("Failed to save username");
    }
  };

  const fetchUserData = async (address: string) => {
    setIsLoading(true);
    try {
      const reviews = await fetchWalletBookclubReviews(address);
      const displayReviews: DisplayReview[] = reviews.map((review) => ({
        id: review.id,
        title: review.title,
        content: review.content,
        createdAt: review.created_at,
      }));
      setBookclubReviews(displayReviews);

      const cards = await fetchWalletAmbientCards(address);
      const displayCards: DisplayCard[] = cards.map((card) => ({
        id: card.id,
        title: card.title,
        content: card.content,
        createdAt: card.created_at,
      }));
      setAmbientCards(displayCards);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-lg text-gray-500">
          Please connect your wallet to view your profile
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-12">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Wallet Address</h2>
        <p className="text-gray-600 bg-gray-100 p-2 rounded">{account}</p>
      </div>

      <h2 className="text-xl font-semibold mb-2">Username</h2>

      <div className="flex mb-6">
        <div className="flex">
          {isEditingUsername ? (
            <div className="flex items-center gap-2">
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter your username"
                className="max-w-md w-1/2"
              />
              <Button onClick={saveUsername}>Save</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingUsername(false);
                  setNewUsername(username);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <p className="text-gray-600 bg-gray-100 p-2 rounded w-[200px]">
              {username || "No username set"}
            </p>
          )}
          {!isEditingUsername && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingUsername(true)}
              className="flex items-center ml-6"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="bookclub" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="bookclub" className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Bookclub Reviews
          </TabsTrigger>
          <TabsTrigger value="ambient" className="flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            AmbiNet Entries
          </TabsTrigger>
          <TabsTrigger value="staking" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Membership
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookclub">
          {isLoading ? (
            <Loading variant="card" count={2} />
          ) : bookclubReviews.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {bookclubReviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <CardTitle>{review.title}</CardTitle>
                    <CardDescription>{review.createdAt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{review.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              No bookclub reviews yet, please add a review on the bookclub page
            </p>
          )}
        </TabsContent>

        <TabsContent value="ambient">
          {isLoading ? (
            <Loading variant="card" count={2} />
          ) : ambientCards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {ambientCards.map((card) => (
                <Card key={card.id}>
                  <CardHeader>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.createdAt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{card.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              No ambinet entries yet, please add an entry on the ambinet page
            </p>
          )}
        </TabsContent>

        <TabsContent value="staking">
          {/* Network Info */}
          {networkInfo && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Connected Network: {networkInfo.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    Chain ID: {networkInfo.chainId}
                  </p>
                </div>
                {networkInfo.name === "Unknown Network" && (
                  <div className="text-yellow-600 text-sm">
                    ⚠️ Network may not be supported
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {stakingError && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-red-500 text-lg">📚</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    Book Club Connection Issue
                  </p>
                  <p className="text-sm text-red-600">{stakingError}</p>
                </div>
              </div>
              <Button
                onClick={() => fetchStakingData(account!)}
                className="mt-2 text-sm"
                variant="outline"
                size="sm"
              >
                Reconnect
              </Button>
            </div>
          )}

          {isStakingLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading book club information...</p>
            </div>
          ) : stakingError ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-lg font-medium">
                Book Club Temporarily Unavailable
              </p>
              <p className="text-sm mt-2">
                Please check your network connection and try again.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Main Cards Row */}
              <div className="grid gap-10 lg:grid-cols-2">
                {/* Membership Status Card */}
                <Card className="border-l-4 border-l-blue-500 h-fit">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                      Membership Status
                    </CardTitle>
                    <CardDescription className="text-base">
                      Your current book club membership and reading progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <p className="text-xl font-semibold">
                          {stakeInfo?.isStaked ? (
                            <span className="text-green-600 flex items-center gap-2">
                              ✓ Active Member
                            </span>
                          ) : (
                            <span className="text-gray-500 flex items-center gap-2">
                              📖 Not a Member
                            </span>
                          )}
                        </p>
                      </div>
                      {stakeInfo?.isStaked && (
                        <div className="text-right">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-2xl">✓</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {stakeInfo?.isStaked && (
                      <>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="text-center p-6 bg-gray-50 rounded-xl">
                            <p className="text-3xl font-bold text-blue-600 mb-2">
                              {parseFloat(stakeInfo.stakedAmount).toFixed(0)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {tokenInfo?.symbol || "USDC"} Committed
                            </p>
                          </div>
                          <div className="text-center p-6 bg-gray-50 rounded-xl">
                            <p className="text-3xl font-bold text-green-600 mb-2">
                              {stakeInfo.participation}%
                            </p>
                            <p className="text-sm text-gray-600">
                              Participation
                            </p>
                          </div>
                        </div>

                        {/* Participation Progress Bar */}
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">
                              Reading Progress
                            </span>
                            <span className="font-semibold">
                              {stakeInfo.participation}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className={`h-4 rounded-full transition-all duration-500 ${
                                stakeInfo.participation >= 80
                                  ? "bg-green-500"
                                  : stakeInfo.participation >= 60
                                  ? "bg-blue-500"
                                  : stakeInfo.participation >= 40
                                  ? "bg-yellow-500"
                                  : stakeInfo.participation > 0
                                  ? "bg-orange-500"
                                  : "bg-gray-300"
                              }`}
                              style={{
                                width: `${Math.max(
                                  stakeInfo.participation,
                                  5
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Started</span>
                            <span>Excellent Reader</span>
                          </div>
                        </div>

                        {/* Refund Information */}
                        <div className="border-t pt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                Deposit Refund
                              </p>
                              <p className="text-xl font-bold text-blue-600">
                                {parseFloat(stakeInfo.eligibleRefund).toFixed(
                                  2
                                )}{" "}
                                {tokenInfo?.symbol || "USDC"}
                              </p>
                            </div>
                            <div
                              className={`px-4 py-2 rounded-full text-sm font-medium ${
                                stakeInfo.refunded
                                  ? "bg-green-100 text-green-700"
                                  : stakeInfo.participation > 0
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {stakeInfo.refunded
                                ? "Claimed"
                                : stakeInfo.participation > 0
                                ? "Available"
                                : "Pending Assessment"}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Join/Refund Actions Card */}
                <Card className="border-l-4 border-l-green-500 h-fit">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      {stakeInfo?.isStaked ? (
                        <>
                          <Award className="h-6 w-6 text-green-600" />
                          Claim Your Deposit
                        </>
                      ) : (
                        <>
                          <Users className="h-6 w-6 text-blue-600" />
                          Join Our Book Club
                        </>
                      )}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {stakeInfo?.isStaked
                        ? "Claim your deposit refund based on participation"
                        : "Join our reading community with a refundable deposit"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {!stakeInfo?.isStaked ? (
                      <>
                        {/* Join Club Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                              <BookOpen className="h-7 w-7 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-900 text-xl">
                                Membership Deposit
                              </h4>
                              <p className="text-sm text-blue-700">
                                Choose your deposit amount (fully refundable)
                              </p>
                            </div>
                          </div>

                          <div className="space-y-6">
                            {/* Balance Display */}
                            <div className="p-4 bg-white rounded-lg border border-blue-100">
                              <span className="text-blue-600 font-medium">
                                Your Balance:
                              </span>
                              <p className="font-bold text-xl">
                                {parseFloat(tokenBalance).toFixed(2)}{" "}
                                {tokenInfo?.symbol || "USDC"}
                              </p>
                            </div>

                            {/* Deposit Amount Input */}
                            <div className="space-y-3">
                              <label className="text-sm font-medium text-gray-700">
                                Deposit Amount ({tokenInfo?.symbol || "USDC"})
                              </label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Enter deposit amount"
                                  value={customStakeAmount}
                                  onChange={(e) =>
                                    setCustomStakeAmount(e.target.value)
                                  }
                                  className="pr-16 text-lg h-12"
                                  disabled={isStakingLoading}
                                />
                                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                  {tokenInfo?.symbol || "USDC"}
                                </span>
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCustomStakeAmount("50")}
                                  disabled={isStakingLoading}
                                  className="text-sm px-4 py-2"
                                >
                                  50
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCustomStakeAmount("100")}
                                  disabled={isStakingLoading}
                                  className="text-sm px-4 py-2"
                                >
                                  100
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCustomStakeAmount("200")}
                                  disabled={isStakingLoading}
                                  className="text-sm px-4 py-2"
                                >
                                  200
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCustomStakeAmount("500")}
                                  disabled={isStakingLoading}
                                  className="text-sm px-4 py-2"
                                >
                                  500
                                </Button>
                              </div>
                              <p className="text-xs text-gray-500">
                                Suggested amounts or enter your own
                              </p>
                            </div>

                            {/* Validation Messages */}
                            {parseFloat(customStakeAmount) >
                              parseFloat(tokenBalance) && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                ⚠️ Insufficient balance for this amount
                              </div>
                            )}
                            {parseFloat(customStakeAmount) <= 0 &&
                              customStakeAmount !== "" && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                                  ⚠️ Please enter a valid amount
                                </div>
                              )}
                          </div>
                        </div>

                        <Button
                          onClick={handleStake}
                          className="w-full h-16 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          disabled={
                            isStakingLoading ||
                            parseFloat(customStakeAmount) >
                              parseFloat(tokenBalance) ||
                            parseFloat(customStakeAmount) <= 0 ||
                            !!stakingError
                          }
                        >
                          {isStakingLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Joining...
                            </div>
                          ) : (
                            <>
                              📚 Join Book Club ({customStakeAmount}{" "}
                              {tokenInfo?.symbol || "USDC"})
                            </>
                          )}
                        </Button>

                        <div className="text-sm text-gray-600 text-center space-y-3">
                          <p>
                            • Deposit is fully refundable based on your
                            participation
                          </p>
                          <p>• Complete participation = full refund</p>
                          <p>• Join our community of passionate readers!</p>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Refund Section */}
                        {!stakeInfo.refunded && stakeInfo.participation > 0 ? (
                          <>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                  <Award className="h-6 w-6 text-green-600" />
                                </div>
                                <h4 className="font-medium text-green-900 text-lg">
                                  Congratulations!
                                </h4>
                              </div>
                              <p className="text-sm text-green-700 mb-4">
                                Your reading participation has been assessed.
                                You can now claim your deposit refund.
                              </p>
                              <div className="flex justify-between items-center">
                                <span className="text-green-600 font-medium">
                                  Refund Amount:
                                </span>
                                <span className="text-xl font-bold text-green-700">
                                  {parseFloat(stakeInfo.eligibleRefund).toFixed(
                                    2
                                  )}{" "}
                                  {tokenInfo?.symbol || "USDC"}
                                </span>
                              </div>
                            </div>

                            <Button
                              onClick={handleRefund}
                              className="w-full h-14 text-lg font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                              disabled={isStakingLoading || !!stakingError}
                            >
                              {isStakingLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Processing...
                                </div>
                              ) : (
                                <>
                                  🎉 Claim Deposit Refund (
                                  {parseFloat(stakeInfo.eligibleRefund).toFixed(
                                    2
                                  )}{" "}
                                  {tokenInfo?.symbol || "USDC"})
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          <div
                            className={`p-6 rounded-lg text-center ${
                              stakeInfo.refunded
                                ? "bg-green-50 border border-green-200"
                                : "bg-yellow-50 border border-yellow-200"
                            }`}
                          >
                            <div
                              className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                                stakeInfo.refunded
                                  ? "bg-green-100"
                                  : "bg-yellow-100"
                              }`}
                            >
                              <span className="text-3xl">
                                {stakeInfo.refunded ? "✅" : "⏳"}
                              </span>
                            </div>
                            <p
                              className={`font-medium text-lg ${
                                stakeInfo.refunded
                                  ? "text-green-800"
                                  : "text-yellow-800"
                              }`}
                            >
                              {stakeInfo.refunded
                                ? "Deposit Successfully Claimed!"
                                : "Participation Assessment Pending"}
                            </p>
                            <p
                              className={`text-sm mt-2 ${
                                stakeInfo.refunded
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {stakeInfo.refunded
                                ? "Thank you for being part of our book club community!"
                                : "Our moderators will assess your participation soon."}
                            </p>
                          </div>
                        )}

                        {stakeInfo.stakeTime > 0 && (
                          <div className="text-sm text-gray-600 pt-4 border-t flex items-center gap-2">
                            <span className="text-blue-500">📅</span>
                            <span>
                              Member since:{" "}
                              {new Date(
                                stakeInfo.stakeTime * 1000
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Club Statistics - Full Width */}
              {contractStats && (
                <Card className="border-l-4 border-l-indigo-500">
                  <CardHeader className="pb-8">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Award className="h-6 w-6 text-indigo-600" />
                      Book Club Community
                    </CardTitle>
                    <CardDescription className="text-base">
                      Our reading community statistics and member activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div className="text-center p-8 bg-blue-50 rounded-xl">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-10 w-10 text-blue-600" />
                        </div>
                        <p className="text-4xl font-bold text-blue-600 mb-2">
                          {contractStats.totalStakers}
                        </p>
                        <p className="text-sm text-gray-600">Total Members</p>
                      </div>
                      <div className="text-center p-8 bg-green-50 rounded-xl">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="h-10 w-10 text-green-600" />
                        </div>
                        <p className="text-4xl font-bold text-green-600 mb-2">
                          {contractStats.activeStakers}
                        </p>
                        <p className="text-sm text-gray-600">Active Readers</p>
                      </div>
                      <div className="text-center p-8 bg-purple-50 rounded-xl">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Coins className="h-10 w-10 text-purple-600" />
                        </div>
                        <p className="text-4xl font-bold text-purple-600 mb-2">
                          {parseFloat(contractStats.totalStaked).toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total Deposits ({tokenInfo?.symbol || "USDC"})
                        </p>
                      </div>
                      <div className="text-center p-8 bg-orange-50 rounded-xl">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="h-10 w-10 text-orange-600" />
                        </div>
                        <p className="text-4xl font-bold text-orange-600 mb-2">
                          {parseFloat(
                            contractStats.totalRewardsDistributed
                          ).toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Refunds Claimed ({tokenInfo?.symbol || "USDC"})
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
