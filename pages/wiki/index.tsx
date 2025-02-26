import React from "react";
import dynamic from "next/dynamic";

// 动态导入 WikiData 并禁用 SSR
const WikiData = dynamic(() => import("@/components/wiki/wikiData"), {
  ssr: false,
});

export default function WikiIndexPage() {
  return <WikiData />;
}
