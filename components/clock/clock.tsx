"use client";
import { useState } from "react";
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

// 设置固定大小
const CLOCK_SIZE = 750; // 时钟的固定尺寸 (px)
const BASE_RADIUS = CLOCK_SIZE * 0.07; // 计算基础半径

export default function Clock({ onDataSelect, monthData }: ClockProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
    <div className="relative min-w-[750px] min-h-[750px] w-[750px] h-[750px] mx-auto">
      <div
        style={{
          width: CLOCK_SIZE,
          height: CLOCK_SIZE,
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {/* center */}
        <Center radius={BASE_RADIUS} text={"RAW SCHOOL"} />
        <Line
          startRadius={BASE_RADIUS}
          endRadius={BASE_RADIUS * 2.67}
          segments={36}
        />
        <Dot radius={BASE_RADIUS * 1.33} dotSpeed={0.002} text="YEAR" />
        <Dot radius={BASE_RADIUS * 1.67} dotSpeed={-0.003} text="SEASON" />
        <Dot radius={BASE_RADIUS * 2} dotSpeed={0.004} text="MONTH" />
        <Dot radius={BASE_RADIUS * 2.33} dotSpeed={-0.005} text="WEEK" />
        <Dot radius={BASE_RADIUS * 2.67} dotSpeed={0.006} text="DAY" />
        {/* outer ring */}
        <Thick
          radius={BASE_RADIUS * 3.25}
          texts={monthData.map((item) => item.month)}
          setSelectedIndex={handleSelectionChange}
        />
        <Name
          radius={BASE_RADIUS * 3.67}
          text={monthData.map((item) => item.people)}
          selectedIndex={selectedIndex}
          selectedIndices={selectedMonthIndices}
          onSelect={handleSelectionChange}
        />
        <Title
          radius={BASE_RADIUS * 4.83}
          text={monthData.map((item) => item.title)}
          selectedIndex={selectedIndex}
          selectedIndices={selectedMonthIndices}
          onSelect={handleSelectionChange}
        />
      </div>
    </div>
  );
}
