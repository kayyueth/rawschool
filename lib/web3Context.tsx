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

  // 检查是否有可用的以太坊提供者
  const checkEthereumProvider = () => {
    return (
      typeof window !== "undefined" && typeof window.ethereum !== "undefined"
    );
  };

  // 检查如果钱包曾经连接过
  useEffect(() => {
    const storedAccount = localStorage.getItem("walletAddress");
    if (storedAccount) {
      setAccount(storedAccount);
      setIsConnected(true);

      // 简化流程：自动设置为已验证
      setIsAuthenticated(true);
      setUser({
        id: storedAccount,
        wallet_address: storedAccount,
        nonce: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, []);

  // 简化的认证检查
  const checkAuthentication = async () => {
    // 简化流程：如果已连接，则自动视为已验证
    if (account) {
      setIsAuthenticated(true);
      setUser({
        id: account,
        wallet_address: account,
        nonce: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
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
        setAccount(accounts[0]);
        setIsConnected(true);
        // 简化流程：连接钱包后自动设置为已验证
        setIsAuthenticated(true);
        setUser({
          id: accounts[0],
          wallet_address: accounts[0],
          nonce: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        localStorage.setItem("walletAddress", accounts[0]);
      }
    } catch (err) {
      console.error("连接钱包失败:", err);
      setError("连接钱包失败");
    } finally {
      setIsConnecting(false);
    }
  };

  // 认证钱包与后端 - 简化为直接返回true
  const authenticateWallet = async (): Promise<boolean> => {
    if (!account) {
      setError("请先连接钱包");
      return false;
    }

    // 简化流程：直接设置为已验证
    setIsAuthenticated(true);
    setUser({
      id: account,
      wallet_address: account,
      nonce: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return true;
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
