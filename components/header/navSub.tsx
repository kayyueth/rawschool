"use client";

import { Globe, LogOut, User, ScanFace } from "lucide-react";
import { useWeb3 } from "@/lib/web3Context";
import { useLanguage } from "@/lib/languageContext";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import ProfileView from "@/components/profile/ProfileView";
import AuthModal from "@/components/auth/AuthModal";

function NavSubComponent() {
  const { account, isConnecting, isConnected, error, disconnectWallet } =
    useWeb3();
  const { language, setLanguage, t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
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

  const handleShowProfile = () => {
    setShowProfile(true);
    setShowMenu(false);
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === "en" ? "zh" : "en");
  };

  // 处理断开连接
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      toast.success(t("disconnected.success"));
      setShowMenu(false);
    } catch (err) {
      toast.error(t("failed.disconnect"));
    }
  };

  return (
    <div className="flex justify-between items-center py-4 px-6 bg-black md:ml-20 md:mr-20 h-8 md:h-16">
      <div className="flex items-center">
        <button
          onClick={toggleLanguage}
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <Globe className="text-[#FCFADE] w-4 h-4 md:w-6 md:h-6 mr-2" />
          <span className="text-[#FCFADE] font-semibold text-xs md:text-lg">
            {t("english.language")}
          </span>
        </button>
      </div>

      <div className="relative">
        {!isConnected ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAuth(true)}
              className="flex text-[#FCFADE] font-semibold text-xs md:text-lg hover:text-gray-300 transition-colors"
            >
              <ScanFace className="w-4 h-4 md:w-6 md:h-6 mr-2 md:mt-1" />
              {t("Login In")}
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="text-[#FCFADE] text-sm mr-2">
              {formatAddress(account || "")}
            </span>
            <button
              onClick={toggleMenu}
              className="flex text-[#FCFADE] font-semibold text-sm hover:text-gray-300 transition-colors"
            >
              <ScanFace className="w-5 h-5 mr-1" />
            </button>

            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-8 bg-black border border-gray-700 rounded shadow-lg z-10"
              >
                <button
                  onClick={handleShowProfile}
                  className="flex items-center w-full px-4 py-2 text-[#FCFADE] hover:bg-gray-800 transition-colors"
                >
                  <User className="w-4 h-4 mr-2" />
                  {t("profile")}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center w-full px-4 py-2 text-[#FCFADE] hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("unconnect")}
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

      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex justify-center items-start overflow-y-auto pt-16">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 relative">
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <ProfileView />
          </div>
        </div>
      )}

      {showAuth && (
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}

// Client-side only wrapper to prevent hydration issues
export default function NavSub() {
  const [isClient, setIsClient] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  if (!isClient) {
    return (
      <div className="flex justify-between items-center py-4 px-6 bg-black md:ml-20 md:mr-20 h-8 md:h-16">
        <div className="flex items-center">
          <div className="flex items-center">
            <Globe className="text-[#FCFADE] w-4 h-4 md:w-6 md:h-6 mr-2" />
            <span className="text-[#FCFADE] font-semibold text-xs md:text-lg">
              English
            </span>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={toggleMenu}
            className="flex text-[#FCFADE] font-semibold text-xs md:text-lg hover:text-gray-300 transition-colors"
          >
            <ScanFace className="w-4 h-4 md:w-6 md:h-6 mr-2 md:mt-1" />
            Login In
          </button>
        </div>
      </div>
    );
  }

  return <NavSubComponent />;
}
