"use client";
import { useState, useEffect } from "react";
import Center from "./center";
import Dot from "./dot";
import Line from "./line";
import Thick from "./thick";
import Name from "./name";
import Title from "./title";
import { text1, text2, text3 } from "./text";

export default function Clock() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 添加全局点击事件监听器
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // 获取点击事件的目标元素
      const target = e.target as HTMLElement;

      // 检查点击是否在 canvas 元素之外
      if (!target.closest("canvas")) {
        setSelectedIndex(null);
        console.log("Clicked outside, clearing selection");
      }
    };

    // 添加事件监听器
    document.addEventListener("click", handleGlobalClick);

    // 清理函数
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "1000px", height: "950px" }}>
      {/* center */}
      <Center radius={60} text={"RAW SCHOOL"} />
      <Line startRadius={60} endRadius={160} segments={36} />
      <Dot radius={80} dotSpeed={0.002} text="YEAR" />
      <Dot radius={100} dotSpeed={-0.003} text="SEASON" />
      <Dot radius={120} dotSpeed={0.004} text="MONTH" />
      <Dot radius={140} dotSpeed={-0.005} text="WEEK" />
      <Dot radius={160} dotSpeed={0.006} text="DAY" />
      {/* outer ring */}
      <Thick radius={195} texts={text1} setSelectedIndex={setSelectedIndex} />
      <Name radius={220} text={text2} selectedIndex={selectedIndex} />
      <Title radius={290} text={text3} selectedIndex={selectedIndex} />
    </div>
  );
}
