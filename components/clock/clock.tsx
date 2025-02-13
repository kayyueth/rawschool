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
  month: string;
  people: string;
  title: string;
}

export default function Clock() {
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
          .order("month");

        if (error) {
          throw error;
        }

        if (data) {
          const formattedData: BookclubData[] = data.map((item) => ({
            month: item.month,
            people: item.people,
            title: item.title,
          }));

          setMonthData(formattedData);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
        setSelectedIndex={setSelectedIndex}
      />
      <Name
        radius={220}
        text={monthData.map((item) => item.people)}
        selectedIndex={selectedIndex}
      />
      <Title
        radius={290}
        text={monthData.map((item) => item.title)}
        selectedIndex={selectedIndex}
      />
    </div>
  );
}
