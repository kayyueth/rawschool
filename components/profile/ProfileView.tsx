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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import {
  updateUsername,
  getUsernameByWalletAddress,
} from "@/lib/auth/userService";

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

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold mb-2">Username</h2>
          {!isEditingUsername && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingUsername(true)}
              className="flex items-center"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        {isEditingUsername ? (
          <div className="flex items-center gap-2">
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter your username"
              className="max-w-md"
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
          <p className="text-gray-600 bg-gray-100 p-2 rounded">
            {username || "No username set"}
          </p>
        )}
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
              No bookclub reviews yet, please add a review on the bookclub page
            </p>
          )}
        </TabsContent>

        <TabsContent value="ambient">
          {isLoading ? (
            <p>Loading...</p>
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
      </Tabs>
    </div>
  );
}
