"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "zh";

interface Translations {
  [key: string]: {
    en: string;
    zh: string;
  };
}

// Add your translations here
const translations: Translations = {
  "english.language": {
    en: "English Language",
    zh: "简体中文",
  },
  "connect.wallet": {
    en: "Connect Wallet",
    zh: "连接钱包",
  },
  connecting: {
    en: "Connecting...",
    zh: "连接中...",
  },
  profile: {
    en: "Profile",
    zh: "个人资料",
  },
  unconnect: {
    en: "Unconnect",
    zh: "断开连接",
  },
  "wallet.connected.success": {
    en: "Wallet connected successfully",
    zh: "钱包连接成功",
  },
  "failed.connect.wallet": {
    en: "Failed to connect wallet",
    zh: "连接钱包失败",
  },
  "disconnected.success": {
    en: "Disconnected successfully",
    zh: "断开连接成功",
  },
  "failed.disconnect": {
    en: "Failed to disconnect",
    zh: "断开连接失败",
  },
  "bookclub.calendar": {
    en: "Bookclub Calender",
    zh: "读书会日历",
  },
  "ambinet.project": {
    en: "AmbiNet Project",
    zh: "AmbiNet 项目",
  },
  "join.us": {
    en: "Join Us",
    zh: "加入我们",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }

    // Fallback to the key itself if translation is not found
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
