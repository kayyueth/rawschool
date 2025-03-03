"use client";

import { Globe, Link2, LogOut, User } from "lucide-react";
import { useWeb3 } from "@/lib/web3Context";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function NavSub() {
  const {
    account,
    isConnecting,
    isConnected,
    isAuthenticated,
    error,
    connectWallet,
    disconnectWallet,
    authenticateWallet,
  } = useWeb3();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Format address to show only first 6 and last 4 characters
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Toggle dropdown menu
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // 处理连接钱包
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast.success("钱包连接成功");
    } catch (err) {
      toast.error("连接钱包失败");
    }
  };

  // 处理断开连接
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      toast.success("已断开连接");
      setShowMenu(false);
    } catch (err) {
      toast.error("断开连接失败");
    }
  };

  return (
    <div className="flex bg-black h-12 ml-20 mr-20 items-center justify-between">
      <a
        href="/about"
        className="flex text-[#FCFADE] font-semibold text-lg ml-8"
      >
        <Globe className="w-5 h-5 mr-2 mt-1" /> ENGLISH
      </a>

      <div className="relative" ref={menuRef}>
        {!isConnected ? (
          <button
            onClick={handleConnectWallet}
            className="flex text-[#FCFADE] font-semibold text-lg mr-6 hover:text-gray-300 transition-colors"
            disabled={isConnecting}
          >
            <Link2 className="w-6 h-6 mr-2 mt-1" />
            {isConnecting ? "连接中..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="flex items-center">
            <span className="text-[#FCFADE] text-sm mr-2">
              {formatAddress(account || "")}
            </span>
            <button
              onClick={toggleMenu}
              className="flex text-[#FCFADE] font-semibold text-sm mr-6 hover:text-gray-300 transition-colors"
            >
              <User className="w-5 h-5 mr-1" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-black border border-gray-700 rounded shadow-lg z-10">
                <button
                  onClick={handleDisconnect}
                  className="flex items-center w-full px-4 py-2 text-[#FCFADE] hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  断开连接
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="absolute right-0 mt-1 bg-red-100 text-red-600 text-xs p-1 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
