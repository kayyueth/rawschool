"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { ethers } from "ethers";

// Define context types
type Web3ContextType = {
  account: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
};

// Create context with default values
const Web3Context = createContext<Web3ContextType>({
  account: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
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
  const [error, setError] = useState<string | null>(null);

  // Check if wallet was previously connected
  useEffect(() => {
    const storedAccount = localStorage.getItem("walletAddress");
    if (storedAccount) {
      setAccount(storedAccount);
      setIsConnected(true);
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

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    localStorage.removeItem("walletAddress");
  };

  // Context value
  const value = {
    account,
    isConnecting,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Add type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
