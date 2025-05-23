"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { ethers } from "ethers";
import { User } from "@/types/auth";
import { supabase } from "./supabaseClient";
import { logger } from "./logger";
import { handleSupabaseError } from "./supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";

// 定义上下文类型
interface Web3ContextType {
  account: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  authenticateWallet: () => Promise<boolean>;
}

// 创建上下文，设置默认值
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

// 创建钩子，方便使用上下文
export const useWeb3 = () => useContext(Web3Context);

// 定义Provider属性
interface Web3ProviderProps {
  children: ReactNode;
}

// Provider组件
export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastConnectionAttemptRef = useRef<number>(0);
  const CONNECTION_COOLDOWN_MS = 2000; // 2 seconds cooldown between connection attempts

  // 检查是否有可用的以太坊提供者
  const checkEthereumProvider = (): boolean => {
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
        logger.info("找到现有用户", { userId: existingUser.id });
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
          logger.error(
            "创建用户失败",
            createError as unknown as Record<string, unknown>
          );
          return null;
        }

        logger.info("创建新用户", { userId: newUser.id });
        return newUser as User;
      }

      logger.error(
        "查询用户时出错",
        findError as unknown as Record<string, unknown>
      );
      return null;
    } catch (error) {
      logger.error(
        "获取或创建用户失败",
        error as unknown as Record<string, unknown>
      );
      return null;
    }
  };

  // 连接钱包
  const connectWallet = async (): Promise<void> => {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
      logger.warn("已有连接请求正在处理中，请等待");
      return;
    }

    // Check if we're within the cooldown period
    const now = Date.now();
    if (now - lastConnectionAttemptRef.current < CONNECTION_COOLDOWN_MS) {
      logger.warn(`请等待 ${CONNECTION_COOLDOWN_MS / 1000} 秒后再尝试连接`);
      return;
    }

    // Update the last attempt timestamp
    lastConnectionAttemptRef.current = now;

    if (!checkEthereumProvider()) {
      const errorMsg = "MetaMask未安装，请安装MetaMask或使用支持以太坊的浏览器";
      setError(errorMsg);
      logger.warn(errorMsg);
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
          logger.info("钱包连接成功", { address: walletAddress });
        }
      }
    } catch (err) {
      const errorMsg = "连接钱包失败";

      // Handle specific MetaMask errors
      if (typeof err === "object" && err !== null) {
        const error = err as any;

        // Handle the "Already processing" error specifically
        if (error.code === -32002) {
          setError("MetaMask 正在处理请求，请等待或刷新页面后重试");
          logger.warn(
            "MetaMask 正在处理请求",
            error as unknown as Record<string, unknown>
          );
          return;
        }

        // Handle user rejected request
        if (error.code === 4001) {
          setError("用户拒绝了连接请求");
          logger.warn(
            "用户拒绝了连接请求",
            error as unknown as Record<string, unknown>
          );
          return;
        }
      }

      logger.error(errorMsg, err as unknown as Record<string, unknown>);
      setError(errorMsg);
    } finally {
      setIsConnecting(false);
    }
  };

  // 认证钱包与后端
  const authenticateWallet = async (): Promise<boolean> => {
    if (!account) {
      const errorMsg = "请先连接钱包";
      setError(errorMsg);
      logger.warn(errorMsg);
      return false;
    }

    try {
      // 获取或创建用户
      const userData = await getOrCreateUser(account);
      if (userData) {
        setIsAuthenticated(true);
        setUser(userData);
        logger.info("钱包认证成功", { address: account });
        return true;
      }

      return false;
    } catch (err) {
      const errorMsg = "钱包认证失败";
      logger.error(errorMsg, err as unknown as Record<string, unknown>);
      setError(errorMsg);
      return false;
    }
  };

  // 断开钱包连接
  const disconnectWallet = async (): Promise<void> => {
    try {
      setAccount(null);
      setIsConnected(false);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("walletAddress");
      logger.info("钱包断开连接");
    } catch (err) {
      logger.error(
        "断开钱包连接失败",
        err as unknown as Record<string, unknown>
      );
    }
  };

  // 初始化：检查本地存储中的钱包地址
  useEffect(() => {
    const initWallet = async () => {
      // Skip initialization if already connecting
      if (isConnecting) {
        return;
      }

      // Check if we're within the cooldown period
      const now = Date.now();
      if (now - lastConnectionAttemptRef.current < CONNECTION_COOLDOWN_MS) {
        logger.debug(`钱包初始化等待冷却期结束`);
        return;
      }

      // Update the last attempt timestamp
      lastConnectionAttemptRef.current = now;

      const savedAddress = localStorage.getItem("walletAddress");

      if (savedAddress && checkEthereumProvider()) {
        try {
          setIsConnecting(true);
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();

          // 确认钱包中仍有该账户
          if (accounts.includes(savedAddress)) {
            setAccount(savedAddress);
            setIsConnected(true);

            // 获取用户数据
            const userData = await getOrCreateUser(savedAddress);
            if (userData) {
              setIsAuthenticated(true);
              setUser(userData);
              logger.info("恢复钱包连接", { address: savedAddress });
            }
          } else {
            // 保存的地址不再可用，清除本地存储
            localStorage.removeItem("walletAddress");
          }
        } catch (err) {
          logger.error(
            "恢复钱包连接失败",
            err as unknown as Record<string, unknown>
          );
          localStorage.removeItem("walletAddress");
        } finally {
          setIsConnecting(false);
        }
      }
    };

    initWallet();
  }, []);

  // 监听账户变化
  useEffect(() => {
    if (checkEthereumProvider()) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // 用户断开了所有账户
          await disconnectWallet();
        } else if (accounts[0] !== account) {
          // 用户切换了账户
          setAccount(accounts[0]);
          localStorage.setItem("walletAddress", accounts[0]);

          // 获取新账户的用户数据
          const userData = await getOrCreateUser(accounts[0]);
          if (userData) {
            setIsAuthenticated(true);
            setUser(userData);
            logger.info("切换钱包账户", { address: accounts[0] });
          }
        }
      };

      // 添加事件监听器
      window.ethereum?.on("accountsChanged", handleAccountsChanged);

      // 清理函数
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
        }
      };
    }
  }, [account]);

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnecting,
        isConnected,
        isAuthenticated,
        user,
        error,
        connectWallet,
        disconnectWallet,
        authenticateWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// Add type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
