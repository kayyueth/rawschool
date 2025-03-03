"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { User } from "@/types/auth";

// Define context types
type Web3ContextType = {
  account: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  authenticateWallet: () => Promise<boolean>;
};

// Create context with default values
const Web3Context = createContext<Web3ContextType>({
  account: null,
  isConnecting: false,
  isConnected: false,
  isAuthenticated: false,
  user: null,
  error: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  authenticateWallet: async () => false,
});

// Create hook for easy context usage
export const useWeb3 = () => useContext(Web3Context);

// Define provider props
interface Web3ProviderProps {
  children: ReactNode;
}

// Provider component
export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet was previously connected
  useEffect(() => {
    const storedAccount = localStorage.getItem("walletAddress");
    if (storedAccount) {
      setAccount(storedAccount);
      setIsConnected(true);

      // 检查是否已认证
      checkAuthentication();
    }
  }, []);

  // 检查用户是否已认证
  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setIsAuthenticated(true);
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error("检查认证状态失败:", error);
    }
  };

  // Handle chain changes and account changes
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      // Handle account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          disconnectWallet();
        } else {
          // User switched account
          setAccount(accounts[0]);
          localStorage.setItem("walletAddress", accounts[0]);
          setIsConnected(true);
          setIsAuthenticated(false);
          setUser(null);
        }
      });

      // Handle chain changes
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      // Clean up listeners
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Request account access
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        localStorage.setItem("walletAddress", accounts[0]);
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Authenticate wallet with backend
  const authenticateWallet = async (): Promise<boolean> => {
    if (!account) {
      setError("请先连接钱包");
      return false;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // 1. 请求签名挑战
      const challengeResponse = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet_address: account }),
      });

      if (!challengeResponse.ok) {
        const errorData = await challengeResponse.json();
        throw new Error(errorData.error || "获取签名挑战失败");
      }

      const { message } = await challengeResponse.json();

      // 2. 请求用户签名
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);

      // 3. 验证签名
      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_address: account,
          signature,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || "验证签名失败");
      }

      const authData = await verifyResponse.json();

      // 4. 设置认证状态
      setIsAuthenticated(true);
      setUser(authData.user);

      return true;
    } catch (err: any) {
      console.error("认证钱包失败:", err);
      setError(err.message || "认证钱包失败");
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    try {
      // 如果已认证，调用登出API
      if (isAuthenticated) {
        await fetch("/api/auth/logout", {
          method: "POST",
        });
      }

      // 清除本地状态
      setAccount(null);
      setIsConnected(false);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("walletAddress");
    } catch (err) {
      console.error("登出失败:", err);
    }
  };

  // Context value
  const value = {
    account,
    isConnecting,
    isConnected,
    isAuthenticated,
    user,
    error,
    connectWallet,
    disconnectWallet,
    authenticateWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Add type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
