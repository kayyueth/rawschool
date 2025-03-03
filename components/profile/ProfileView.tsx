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
import { BookOpen, Sparkles } from "lucide-react";

// 这里定义类型，实际项目中可能需要从types文件导入
interface BookclubReview {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface AmbientCardEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function ProfileView() {
  const { account, isConnected } = useWeb3();
  const [bookclubReviews, setBookclubReviews] = useState<BookclubReview[]>([]);
  const [ambientEntries, setAmbientEntries] = useState<AmbientCardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 如果用户已连接钱包，则获取数据
    if (isConnected && account) {
      fetchUserData(account);
    }
  }, [isConnected, account]);

  const fetchUserData = async (address: string) => {
    setIsLoading(true);
    try {
      // 这里应该是实际的API调用，获取用户的bookclub reviews
      // 示例数据，实际项目中应替换为API调用
      const mockBookclubReviews: BookclubReview[] = [
        {
          id: "1",
          title: "《三体》读后感",
          content:
            "刘慈欣的《三体》是一部震撼人心的科幻巨作，它不仅展现了宏大的宇宙观，还深刻探讨了人性...",
          createdAt: "2023-10-15",
        },
        {
          id: "2",
          title: "《活着》读后感",
          content:
            "余华的《活着》以其朴实无华的叙事风格，讲述了一个普通人在时代变迁中的生存故事...",
          createdAt: "2023-09-22",
        },
      ];

      // 示例数据，实际项目中应替换为API调用
      const mockAmbientEntries: AmbientCardEntry[] = [
        {
          id: "1",
          title: "夏日午后",
          content:
            "阳光透过树叶的缝隙洒在地上，形成斑驳的光影。微风拂过，带来一丝清凉...",
          createdAt: "2023-10-10",
        },
        {
          id: "2",
          title: "雨夜",
          content:
            "雨滴敲打着窗户，城市的灯光在雨中变得模糊。我坐在窗前，听着雨声，思绪万千...",
          createdAt: "2023-09-18",
        },
      ];

      setBookclubReviews(mockBookclubReviews);
      setAmbientEntries(mockAmbientEntries);
    } catch (error) {
      console.error("获取用户数据失败:", error);
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

      <Tabs defaultValue="bookclub" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="bookclub" className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Bookclub Reviews
          </TabsTrigger>
          <TabsTrigger value="ambient" className="flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Ambient Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookclub">
          {isLoading ? (
            <p>Loading...</p>
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
              No bookclub reviews
            </p>
          )}
        </TabsContent>

        <TabsContent value="ambient">
          {isLoading ? (
            <p>Loading...</p>
          ) : ambientEntries.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {ambientEntries.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <CardTitle>{entry.title}</CardTitle>
                    <CardDescription>{entry.createdAt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{entry.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No ambient cards</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
