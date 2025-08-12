"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { User, AuthMethod, AuthState } from "@/types/auth";
import { toast } from "sonner";
import { useWeb3 } from "@/lib/web3Context";

interface AuthContextValue {
  state: AuthState;
  isLoaded: boolean;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (params: {
    email: string;
    password: string;
    username?: string;
    display_name?: string;
  }) => Promise<boolean>;
  loginWithWallet: () => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    expires_at: null,
    auth_method: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const { connectWallet } = useWeb3();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user: data.user as User,
        }));
      } else {
        setState({
          isAuthenticated: false,
          user: null,
          token: null,
          expires_at: null,
          auth_method: null,
        });
      }
    } catch {
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        expires_at: null,
        auth_method: null,
      });
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Login failed");
          return false;
        }
        setState({
          isAuthenticated: true,
          user: data.user as User,
          token: data.token,
          expires_at: data.expires_at,
          auth_method: data.auth_method as AuthMethod,
        });
        toast.success("Logged in");
        return true;
      } catch {
        toast.error("Login failed");
        return false;
      }
    },
    []
  );

  const registerWithEmail = useCallback(
    async (params: {
      email: string;
      password: string;
      username?: string;
      display_name?: string;
    }) => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Registration failed");
          return false;
        }
        toast.success("Registration successful. Check your email to verify.");
        return true;
      } catch {
        toast.error("Registration failed");
        return false;
      }
    },
    []
  );

  const loginWithWallet = useCallback(async () => {
    try {
      await connectWallet();
      // After wallet connect, call /api/auth/verify with signature flow client-side as needed.
      await refresh();
      return true;
    } catch {
      toast.error("Wallet login failed");
      return false;
    }
  }, [connectWallet, refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        expires_at: null,
        auth_method: null,
      });
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      isLoaded,
      loginWithEmail,
      registerWithEmail,
      loginWithWallet,
      logout,
      refresh,
    }),
    [
      state,
      isLoaded,
      loginWithEmail,
      registerWithEmail,
      loginWithWallet,
      logout,
      refresh,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
