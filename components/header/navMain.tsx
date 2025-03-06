"use client";

import { useLanguage } from "@/lib/languageContext";

interface NavMainProps {
  onViewChange?: (view: "book" | "reviews" | "join" | "wiki") => void;
}

export default function NavMain({ onViewChange }: NavMainProps) {
  const { t } = useLanguage();

  return (
    <div className="flex ml-20 mr-20 mt-4 justify-between text-xl border-b-2 border-black">
      <div className="mb-4">
        <button onClick={() => onViewChange?.("book")} className="ml-8">
          {t("bookclub.calendar")}
        </button>
        <button onClick={() => onViewChange?.("wiki")} className="ml-8">
          {t("ambinet.project")}
        </button>
      </div>

      <div className="">
        <button
          onClick={() => onViewChange?.("join")}
          className="mr-8 hover:opacity-70 transition-opacity"
        >
          {t("join.us")}
        </button>
      </div>
    </div>
  );
}
