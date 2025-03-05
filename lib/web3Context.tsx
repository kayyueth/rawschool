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
import { supabase } from "./supabaseClient";

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

  // 检查是否有可用的以太坊提供者
  const checkEthereumProvider = () => {
    return (
      typeof window !== "undefined" && typeof window.ethereum !== "undefined"
    );
  };

  // 获取或创建用户
  const getOrCreateUser = async (
    walletAddress: string
  ): Promise<User | null> => {
    try {
      // 规范化钱包地址
      const normalizedAddress = walletAddress.toLowerCase();

      // 先查找用户
      const { data: existingUser, error: findError } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", normalizedAddress)
        .single();

      if (existingUser) {
        return existingUser as User;
      }

      // 如果用户不存在，创建新用户
      if (findError && findError.code === "PGRST116") {
        // 生成随机 nonce
        const nonce = Math.floor(Math.random() * 1000000).toString();

        // 创建新用户
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert([{ wallet_address: normalizedAddress, nonce }])
          .select()
          .single();

        if (createError) {
          console.error("创建用户失败:", createError);
          return null;
        }

        return newUser as User;
      }

      console.error("查找用户失败:", findError);
      return null;
    } catch (error) {
      console.error("获取或创建用户失败:", error);
      return null;
    }
  };

  // 检查如果钱包曾经连接过
  useEffect(() => {
    const storedAccount = localStorage.getItem("walletAddress");
    if (storedAccount) {
      setAccount(storedAccount);
      setIsConnected(true);

      // 获取用户信息
      getOrCreateUser(storedAccount).then((userData) => {
        if (userData) {
          setIsAuthenticated(true);
          setUser(userData);
        }
      });
    }
  }, []);

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

          // 获取新账户的用户信息
          getOrCreateUser(accounts[0]).then((userData) => {
            if (userData) {
              setIsAuthenticated(true);
              setUser(userData);
            }
          });
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

  // 连接钱包函数
  const connectWallet = async () => {
    if (!checkEthereumProvider()) {
      setError("MetaMask未安装，请安装MetaMask或使用支持以太坊的浏览器");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // 请求账户访问权限
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        const walletAddress = accounts[0];
        setAccount(walletAddress);
        setIsConnected(true);
        localStorage.setItem("walletAddress", walletAddress);

        // 获取或创建用户
        const userData = await getOrCreateUser(walletAddress);
        if (userData) {
          setIsAuthenticated(true);
          setUser(userData);
        }
      }
    } catch (err) {
      console.error("连接钱包失败:", err);
      setError("连接钱包失败");
    } finally {
      setIsConnecting(false);
    }
  };

  // 认证钱包与后端
  const authenticateWallet = async (): Promise<boolean> => {
    if (!account) {
      setError("请先连接钱包");
      return false;
    }

    try {
      // 获取或创建用户
      const userData = await getOrCreateUser(account);
      if (userData) {
        setIsAuthenticated(true);
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error("认证钱包失败:", error);
      setError("认证钱包失败");
      return false;
    }
  };

  // 断开钱包连接
  const disconnectWallet = async () => {
    try {
      // 清除本地状态
      setAccount(null);
      setIsConnected(false);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("walletAddress");
    } catch (err) {
      console.error("断开连接失败:", err);
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
