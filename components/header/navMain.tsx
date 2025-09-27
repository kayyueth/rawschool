"use client";

import { useLanguage } from "@/lib/languageContext";

interface NavMainProps {
  onViewChange?: (view: "book" | "reviews" | "join" | "wiki") => void;
}

export default function NavMain({ onViewChange }: NavMainProps) {
  const { t } = useLanguage();

  return (
    <div className="flex md:px-6 md:ml-20 md:mr-20 md:mt-2 mt-2 justify-between text-xs md:text-xl border-b-2 border-black h-6 md:h-12">
      <div className="flex items-center space-x-8">
        <button
          onClick={() => onViewChange?.("book")}
          className="hover:opacity-70 transition-opacity"
        >
          {t("bookclub.calendar")}
        </button>
        <button
          onClick={() => onViewChange?.("wiki")}
          className="hover:opacity-70 transition-opacity"
        >
          {t("ambinet.project")}
        </button>
      </div>

      <div className="flex items-center space-x-8">
        <button
          onClick={() => window.open("/apply", "_blank")}
          className="hover:opacity-70 transition-opacity"
        >
          {t("join.bookclub")}
        </button>
        <button
          onClick={() => onViewChange?.("join")}
          className="hover:opacity-70 transition-opacity"
        >
          {t("join.us")}
        </button>
      </div>
    </div>
  );
}
