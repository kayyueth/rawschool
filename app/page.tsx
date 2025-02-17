"use client";

import Clock from "@/components/clock/clock";
import Brand from "../components/header/brand";
import NavSub from "../components/header/navSub";
import NavMain from "../components/header/navMain";
import Content from "@/components/bookclub/content";
import Label from "../components/bookclub/label";
import { DataTable } from "@/components/bookclub/data-table";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { BookclubData } from "@/types/bookclub";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [selectedBookData, setSelectedBookData] = useState<BookclubData | null>(
    null
  );
  const [showTable, setShowTable] = useState(false);
  const [monthData, setMonthData] = useState<BookclubData[]>([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FCFADE]">
      {/* Nav Bar */}
      <div className="sticky top-0 z-50 bg-[#FCFADE]">
        <Brand />
        <NavSub />
        <NavMain />
      </div>

      {/* Main Content */}
      <div className="flex justify-between items-start px-24">
        {/* Clock and List View */}
        <div className="w-[45%] relative mt-10">
          {/* Toggle */}
          <div className="absolute z-10 flex items-center space-x-2">
            <Switch checked={showTable} onCheckedChange={setShowTable} />
            <span className="text-lg font-black">
              {showTable ? "Clock View" : "List View"}
            </span>
          </div>
          {/* Table or Clock */}
          {showTable ? (
            <div className="mt-20">
              <DataTable data={monthData} onSelect={setSelectedBookData} />
            </div>
          ) : (
            <>
              <div className="flex flex-col h-[900px]">
                <Clock
                  onDataSelect={setSelectedBookData}
                  monthData={monthData}
                />
                <div className="flex-grow"></div>
                <div className="ml-[20%] text-center">
                  <p className="font-semibold">Raw Bookclub Calendar</p>
                  <p className="mb-10">Updated: Feb 6, 2025</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Label */}
        <div className="ml-10 flex h-screen">
          <Label />
        </div>

        {/* Content */}
        <Content selectedData={selectedBookData} />
      </div>
    </div>
  );
}
