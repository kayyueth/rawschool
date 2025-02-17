"use client";
import { useState, useEffect } from "react";
import Center from "./center";
import Dot from "./dot";
import Line from "./line";
import Thick from "./thick";
import Name from "./name";
import Title from "./title";
import { supabase } from "@/lib/supabaseClient";

interface BookclubData {
  id: number;
  month: string;
  people: string;
  title: string;
  season: string;
  description: string;
}

interface ClockProps {
  onDataSelect: (data: BookclubData | null) => void;
}

export default function Clock({ onDataSelect }: ClockProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [monthData, setMonthData] = useState<BookclubData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from("bookclub")
          .select("*")
          .order("id");

        if (error) {
          throw error;
        }

        if (data) {
          setMonthData(data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // 获取当前选中月份的所有索引
  const selectedMonthIndices =
    selectedIndex !== null
      ? getMonthIndices(monthData[selectedIndex].month)
      : [];

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
      <Thick
        radius={195}
        texts={monthData.map((item) => item.month)}
        setSelectedIndex={handleSelectionChange}
      />
      <Name
        radius={220}
        text={monthData.map((item) => item.people)}
        selectedIndex={selectedIndex}
        selectedIndices={selectedMonthIndices}
        onSelect={handleSelectionChange}
      />
      <Title
        radius={290}
        text={monthData.map((item) => item.title)}
        selectedIndex={selectedIndex}
        selectedIndices={selectedMonthIndices}
        onSelect={handleSelectionChange}
      />
    </div>
  );
}
