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
import { BookOpen, Sparkles, Edit2 } from "lucide-react";
import {
  fetchWalletBookclubReviews,
  fetchWalletAmbientCards,
} from "@/lib/services/userContent";
import { BookclubReview, AmbientCard } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";
import {
  updateUsername,
  getUsernameByWalletAddress,
} from "@/lib/auth/userService";

// 组件内部使用的类型定义
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
  const [activeTab, setActiveTab] = useState("reviews");
  const [isLoading, setIsLoading] = useState(false);
  const [bookclubReviews, setBookclubReviews] = useState<DisplayReview[]>([]);
  const [ambientCards, setAmbientCards] = useState<DisplayCard[]>([]);
  const [username, setUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    // 如果用户已连接钱包，则获取数据
    if (isConnected && account) {
      fetchUserData(account);
      fetchUserProfile(account);
    }
  }, [isConnected, account]);

  const fetchUserProfile = async (address: string) => {
    try {
      const username = await getUsernameByWalletAddress(address);

      if (username) {
        setUsername(username);
        setNewUsername(username);
      }
    } catch (error) {
      console.error("获取用户资料失败:", error);
    }
  };

  const saveUsername = async () => {
    if (!user || !newUsername.trim()) return;

    try {
      const updatedUser = await updateUsername(user.id, newUsername);

      if (updatedUser) {
        setUsername(newUsername);
        setIsEditingUsername(false);
        toast.success("用户名已更新");
      } else {
        toast.error("保存用户名失败");
      }
    } catch (error) {
      console.error("保存用户名失败:", error);
      toast.error("保存用户名失败");
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
      console.error("获取用户数据失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-lg text-gray-500">请连接钱包查看您的个人资料</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-12">
      <h1 className="text-2xl font-bold mb-6">用户资料</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">钱包地址</h2>
        <p className="text-gray-600 bg-gray-100 p-2 rounded">{account}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold mb-2">用户名</h2>
          {!isEditingUsername && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingUsername(true)}
              className="flex items-center"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              编辑
            </Button>
          )}
        </div>

        {isEditingUsername ? (
          <div className="flex items-center gap-2">
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="输入您的用户名"
              className="max-w-md"
            />
            <Button onClick={saveUsername}>保存</Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingUsername(false);
                setNewUsername(username);
              }}
            >
              取消
            </Button>
          </div>
        ) : (
          <p className="text-gray-600 bg-gray-100 p-2 rounded">
            {username || "未设置用户名"}
          </p>
        )}
      </div>

      <Tabs defaultValue="bookclub" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="bookclub" className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            读书评论
          </TabsTrigger>
          <TabsTrigger value="ambient" className="flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Wiki 条目
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookclub">
          {isLoading ? (
            <p>加载中...</p>
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
              暂无读书评论，请在读书俱乐部页面添加
            </p>
          )}
        </TabsContent>

        <TabsContent value="ambient">
          {isLoading ? (
            <p>加载中...</p>
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
              暂无 Wiki 条目，请在 Wiki 页面添加
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
