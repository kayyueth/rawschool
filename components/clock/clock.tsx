"use client";
import { useState, useEffect, useRef } from "react";
import Center from "./center";
import Dot from "./dot";
import Line from "./line";
import Thick from "./thick";
import Name from "./name";
import Title from "./title";
import { BookclubData } from "@/types/bookclub";

interface ClockProps {
  onDataSelect: (data: BookclubData | null) => void;
  monthData: BookclubData[];
}

export default function Clock({ onDataSelect, monthData }: ClockProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;
        const minSize = Math.min(width, height);
        setSize({ width: minSize, height: minSize });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 计算基础半径（以容器大小的比例计算）
  const baseRadius = size.width * 0.09;

  // 获取相同月份的所有索引
  const getMonthIndices = (month: string) => {
    return monthData
      .map((item, index) => (item.month === month ? index : -1))
      .filter((index) => index !== -1);
  };

  // Handle selection change
  const handleSelectionChange = (index: number) => {
    // 如果点击的是当前选中的项，则取消选择
    if (index === selectedIndex) {
      setSelectedIndex(null);
      onDataSelect(null);
    } else {
      setSelectedIndex(index);
      onDataSelect(monthData[index] || null);
    }
  };

  // 获取当前选中月份的所有索引
  const selectedMonthIndices =
    selectedIndex !== null
      ? getMonthIndices(monthData[selectedIndex].month)
      : [];

  return (
    <div ref={containerRef} style={{ aspectRatio: "1/1" }}>
      {/* center */}
      <Center radius={baseRadius} text={"RAW SCHOOL"} />
      <Line
        startRadius={baseRadius}
        endRadius={baseRadius * 2.67}
        segments={36}
      />
      <Dot radius={baseRadius * 1.33} dotSpeed={0.002} text="YEAR" />
      <Dot radius={baseRadius * 1.67} dotSpeed={-0.003} text="SEASON" />
      <Dot radius={baseRadius * 2} dotSpeed={0.004} text="MONTH" />
      <Dot radius={baseRadius * 2.33} dotSpeed={-0.005} text="WEEK" />
      <Dot radius={baseRadius * 2.67} dotSpeed={0.006} text="DAY" />
      {/* outer ring */}
      <Thick
        radius={baseRadius * 3.25}
        texts={monthData.map((item) => item.month)}
        setSelectedIndex={handleSelectionChange}
      />
      <Name
        radius={baseRadius * 3.67}
        text={monthData.map((item) => item.people)}
        selectedIndex={selectedIndex}
        selectedIndices={selectedMonthIndices}
        onSelect={handleSelectionChange}
      />
      <Title
        radius={baseRadius * 4.83}
        text={monthData.map((item) => item.title)}
        selectedIndex={selectedIndex}
        selectedIndices={selectedMonthIndices}
        onSelect={handleSelectionChange}
      />
    </div>
  );
}
