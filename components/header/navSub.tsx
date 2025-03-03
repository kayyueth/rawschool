"use client";

import { Globe, Link2, LogOut, User } from "lucide-react";
import { useWeb3 } from "@/lib/web3Context";
import { useState, useRef, useEffect } from "react";

export default function NavSub() {
  const {
    account,
    isConnecting,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
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
            onClick={connectWallet}
            className="flex text-[#FCFADE] font-semibold text-lg mr-6 hover:text-gray-300 transition-colors"
            disabled={isConnecting}
          >
            <Link2 className="w-6 h-6 mr-2 mt-1" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <>
            <button
              onClick={toggleMenu}
              className="flex text-[#FCFADE] font-semibold text-lg mr-6 hover:text-gray-300 transition-colors"
            >
              <Link2 className="w-6 h-6 mr-2 mt-1" />
              {formatAddress(account || "")}
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                <div className="py-1">
                  <a
                    href={`/profile/${account}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </a>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
