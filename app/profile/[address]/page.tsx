"use client";

import { useEffect, useState } from "react";
import Brand from "@/components/header/brand";
import NavSub from "@/components/header/navSub";
import NavMain from "@/components/header/navMain";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/lib/web3Context";
import { BookclubReview, AmbientCard } from "@/types";
import {
  fetchWalletBookclubReviews,
  fetchWalletAmbientCards,
} from "@/lib/services/userContent";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddReviewModal from "@/components/profile/AddReviewModal";
import AddCardModal from "@/components/profile/AddCardModal";

interface ProfilePageProps {
  params: {
    address: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { address } = params;
  const { account, user } = useWeb3();
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [bookclubReviews, setBookclubReviews] = useState<BookclubReview[]>([]);
  const [ambientCards, setAmbientCards] = useState<AmbientCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookclub");
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check if profile owner is the connected wallet
  useEffect(() => {
    if (account && address) {
      setIsOwner(account.toLowerCase() === address.toLowerCase());
    }
  }, [account, address]);

  // Redirect to home if no address is provided
  useEffect(() => {
    if (!address) {
      router.push("/");
    }
  }, [address, router]);

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      if (!address) return;

      setIsLoading(true);
      try {
        // 获取用户的 BookclubReview 数据
        const reviews = await fetchWalletBookclubReviews(address);
        setBookclubReviews(reviews);

        // 获取用户的 AmbientCard 数据
        const cards = await fetchWalletAmbientCards(address);
        setAmbientCards(cards);
      } catch (error) {
        console.error("获取用户数据失败:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [address]);

  // Handle view change
  const handleViewChange = (view: "book" | "reviews" | "join" | "wiki") => {
    router.push("/");
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle add new review
  const handleAddReview = () => {
    setShowAddReviewModal(true);
  };

  // Handle add new card
  const handleAddCard = () => {
    setShowAddCardModal(true);
  };

  // Handle review added
  const handleReviewAdded = async () => {
    if (address) {
      const reviews = await fetchWalletBookclubReviews(address);
      setBookclubReviews(reviews);
    }
  };

  // Handle card added
  const handleCardAdded = async () => {
    if (address) {
      const cards = await fetchWalletAmbientCards(address);
      setAmbientCards(cards);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFADE]">
      {/* Nav Bar */}
      <div className="sticky top-0 z-50 bg-[#FCFADE]">
        <Brand />
        <NavSub />
        <NavMain onViewChange={handleViewChange} />
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">个人资料</h1>
          <p className="text-gray-600 mb-4">
            钱包地址: {formatAddress(address)}
          </p>
          {isOwner && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md mb-4">
              这是您的个人资料
            </div>
          )}
        </div>

        <Tabs
          defaultValue="bookclub"
          className="w-full"
          onValueChange={handleTabChange}
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="bookclub" className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                读书评论
              </TabsTrigger>
              <TabsTrigger value="ambient" className="flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                灵感卡片
              </TabsTrigger>
            </TabsList>

            {isOwner && activeTab === "bookclub" && (
              <Button onClick={handleAddReview} className="flex items-center">
                <PlusCircle className="w-4 h-4 mr-2" />
                添加评论
              </Button>
            )}

            {isOwner && activeTab === "ambient" && (
              <Button onClick={handleAddCard} className="flex items-center">
                <PlusCircle className="w-4 h-4 mr-2" />
                添加卡片
              </Button>
            )}
          </div>

          <TabsContent value="bookclub">
            {isLoading ? (
              <div className="text-center py-8">
                <p>加载中...</p>
              </div>
            ) : bookclubReviews.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {bookclubReviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <CardTitle>{review.title}</CardTitle>
                      <CardDescription>
                        {new Date(review.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{review.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">暂无读书评论</div>
            )}
          </TabsContent>

          <TabsContent value="ambient">
            {isLoading ? (
              <div className="text-center py-8">
                <p>加载中...</p>
              </div>
            ) : ambientCards.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {ambientCards.map((card) => (
                  <Card key={card.id}>
                    <CardHeader>
                      <CardTitle>{card.title}</CardTitle>
                      <CardDescription>
                        {new Date(card.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{card.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">暂无灵感卡片</div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 添加评论模态框 */}
      {showAddReviewModal && (
        <AddReviewModal
          isOpen={showAddReviewModal}
          onClose={() => setShowAddReviewModal(false)}
          onSuccess={handleReviewAdded}
        />
      )}

      {/* 添加卡片模态框 */}
      {showAddCardModal && (
        <AddCardModal
          isOpen={showAddCardModal}
          onClose={() => setShowAddCardModal(false)}
          onSuccess={handleCardAdded}
        />
      )}
    </div>
  );
}
