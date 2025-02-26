import React from "react";
import dynamic from "next/dynamic";

// 动态导入 WikiCard 并禁用 SSR
const WikiCard = dynamic(() => import("@/components/wiki/wikiCard"), {
  ssr: false,
});

export default function WikiPage() {
  return <WikiCard />;
}
