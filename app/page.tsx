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
import JoinUs from "@/components/join/join-us";
import WikiHome from "@/components/wiki/wikiHome";
import WikiData from "@/components/wiki/wikiData";
import WikiCard from "@/components/wiki/wikiCard";

export default function Home() {
  const [selectedBookData, setSelectedBookData] = useState<BookclubData | null>(
    null
  );
  const [showTable, setShowTable] = useState(false);
  const [monthData, setMonthData] = useState<BookclubData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<
    "book" | "reviews" | "join" | "wiki" | "wikiData" | "wikiDetail"
  >("book");
  const [selectedWikiTitle, setSelectedWikiTitle] = useState<string>("");

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

  // 处理词条详情查看
  const handleViewDetail = (title: string) => {
    console.log(`查看词条详情: ${title}`);
    setSelectedWikiTitle(title);
    setCurrentView("wikiDetail");
  };

  // 处理返回Wiki列表
  const handleBackToWikiList = () => {
    setCurrentView("wikiData");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FCFADE]">
      {/* Nav Bar */}
      <div className="sticky top-0 z-50 bg-[#FCFADE]">
        <Brand />
        <NavSub />
        <NavMain onViewChange={setCurrentView} />
      </div>

      {/* Main Content */}
      {currentView === "join" ? (
        <JoinUs />
      ) : currentView === "wiki" ? (
        <WikiHome onViewChange={setCurrentView} />
      ) : currentView === "wikiData" ? (
        <WikiData onViewDetail={handleViewDetail} />
      ) : currentView === "wikiDetail" && selectedWikiTitle ? (
        <WikiCard
          title={selectedWikiTitle}
          onBackToList={handleBackToWikiList}
        />
      ) : (
        <div className="flex flex-col md:flex-row justify-start items-start px-4 md:px-12 lg:px-24 relative">
          {/* Clock and List View - 固定宽度确保不会挤压 */}
          <div className="w-full md:w-auto relative mt-10">
            {/* Toggle and Controls */}
            <div className="absolute z-10 flex items-center space-x-4 w-full">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showTable}
                  onCheckedChange={(checked) => {
                    setShowTable(checked);
                    console.log("Switch toggled:", checked);
                  }}
                />
                <span
                  className="text-lg font-black text-black cursor-pointer"
                  onClick={() => setShowTable(!showTable)}
                >
                  {showTable ? "List View" : "Clock View"}
                </span>
              </div>
              {showTable}
            </div>

            {/* Table or Clock */}
            {showTable ? (
              <div>
                <DataTable data={monthData} onSelect={setSelectedBookData} />
              </div>
            ) : (
              <>
                <div className="flex flex-col h-auto">
                  {/* 添加溢出控制，确保在小屏幕上不会超出容器 */}
                  <div className="overflow-auto">
                    <Clock
                      onDataSelect={setSelectedBookData}
                      monthData={monthData}
                    />
                  </div>
                  <div className="flex-grow"></div>
                  <div className="text-left text-black mt-4">
                    <p className="font-semibold">Raw Bookclub Calendar</p>
                    <p className="mb-10">Updated: Feb 6, 2025</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 添加一个固定的间距容器，确保Clock和Label之间始终有空间 */}
          <div className="w-8 md:w-16 lg:w-20 flex-shrink-0 h-2 md:h-full"></div>

          {/* Label - 绝对定位改为相对定位，确保在各种屏幕尺寸上不会重叠 */}
          <div className="md:flex h-screen hidden">
            <Label />
          </div>

          {/* 小屏幕上的水平Label */}
          <div className="md:hidden w-full mt-8 border-t-2 border-b-2 border-black py-2 flex justify-between">
            <span>Feb 15th, 2025</span>
            <span className="font-black">RADICAL CRYPTOGRAPHY</span>
          </div>

          {/* Content */}
          <div className="w-full md:w-auto mt-8 ml-10 md:mt-0">
            <Content selectedData={selectedBookData} />
          </div>
        </div>
      )}
    </div>
  );
}
