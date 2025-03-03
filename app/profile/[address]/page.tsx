"use client";

import { useEffect, useState } from "react";
import Brand from "@/components/header/brand";
import NavSub from "@/components/header/navSub";
import NavMain from "@/components/header/navMain";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/lib/web3Context";

interface ProfilePageProps {
  params: {
    address: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { address } = params;
  const { account } = useWeb3();
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);

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

  // Handle view change
  const handleViewChange = (view: "book" | "reviews" | "join" | "wiki") => {
    router.push("/");
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

        {/* Book Club Reviews */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Book Club Reviews</h2>
            {isOwner && (
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                添加新Review
              </button>
            )}
          </div>
          <div className="text-gray-500 italic">暂无数据</div>
        </div>

        {/* Ambient Cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Ambient Cards</h2>
            {isOwner && (
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                添加新Card
              </button>
            )}
          </div>
          <div className="text-gray-500 italic">暂无数据</div>
        </div>
      </div>
    </div>
  );
}
