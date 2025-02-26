import React, { useState } from "react";
import dynamic from "next/dynamic";

// 动态导入 WikiData 和 WikiCard 并禁用 SSR
const WikiData = dynamic(() => import("@/components/wiki/wikiData"), {
  ssr: false,
});

const WikiCard = dynamic(() => import("@/components/wiki/wikiCard"), {
  ssr: false,
});

export default function WikiIndexPage() {
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  // 处理查看词条详情
  const handleViewDetail = (title: string) => {
    setSelectedTitle(title);
    setCurrentView("detail");
  };

  // 处理返回列表
  const handleBackToList = () => {
    setCurrentView("list");
  };

  return (
    <>
      {currentView === "list" && <WikiData onViewDetail={handleViewDetail} />}
      {currentView === "detail" && selectedTitle && (
        <WikiCard title={selectedTitle} onBackToList={handleBackToList} />
      )}
    </>
  );
}
