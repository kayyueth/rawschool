"use client";

import { Button } from "@/components/ui/button";
import Brand from "../components/header/brand";
import NavSub from "../components/header/navSub";
import NavMain from "../components/header/navMain";
import Clock from "@/components/clock/clock";
import Content from "@/components/bookclub/content";
import Label from "../components/bookclub/label";
import { DataTable } from "@/components/bookclub/data-table";
import { Switch } from "@/components/ui/switch";
import JoinUs from "@/components/join/join-us";
import WikiHome from "@/components/wiki/wikiHome";
import WikiData from "@/components/wiki/wikiData";
import WikiCard from "@/components/wiki/wikiCard";
import { Loading } from "@/components/ui/loading";
import { useState, useEffect } from "react";
import { BookclubData } from "@/types/bookclub";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [currentView, setCurrentView] = useState<
    "home" | "bookclub" | "join" | "wiki" | "wikiData" | "wikiDetail"
  >("home");
  const [selectedWikiTitle, setSelectedWikiTitle] = useState<string>("");

  // Bookclub-specific state
  const [selectedBookData, setSelectedBookData] = useState<BookclubData | null>(
    null
  );
  const [showTable, setShowTable] = useState(false);
  const [monthData, setMonthData] = useState<BookclubData[]>([]);
  const [loading, setLoading] = useState(false);

  // Load bookclub data when bookclub view is selected
  useEffect(() => {
    if (currentView === "bookclub" && monthData.length === 0) {
      setLoading(true);
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
    }
  }, [currentView, monthData.length]);

  const handleApply = () => {
    // TODO: Implement apply functionality
    console.log("Apply button clicked");
  };

  // Handle wiki detail view
  const handleViewDetail = (title: string) => {
    setSelectedWikiTitle(title);
    setCurrentView("wikiDetail");
  };

  // Handle back to wiki list
  const handleBackToWikiList = () => {
    setCurrentView("wikiData");
  };

  // Handle return to home page
  const handleReturnHome = () => {
    setCurrentView("home");
  };

  // Handle navigation changes - map "book" to "bookclub"
  const handleNavChange = (view: string) => {
    if (view === "book" || view === "reviews") {
      setCurrentView("bookclub");
    } else {
      setCurrentView(view as any);
    }
  };

  // Handle wiki navigation - map wiki views to our current view types
  const handleWikiNavChange: React.Dispatch<
    React.SetStateAction<
      "book" | "reviews" | "join" | "wiki" | "wikiData" | "wikiDetail"
    >
  > = (value) => {
    if (typeof value === "function") {
      // Handle function-based updates (though WikiHome likely won't use this)
      const currentWikiView =
        currentView === "bookclub" ? ("book" as const) : (currentView as any);
      const newValue = value(currentWikiView);
      if (newValue === "book" || newValue === "reviews") {
        setCurrentView("bookclub");
      } else {
        setCurrentView(newValue as any);
      }
    } else {
      // Handle direct value updates
      if (value === "book" || value === "reviews") {
        setCurrentView("bookclub");
      } else {
        setCurrentView(value as any);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFADE]">
      {/* Nav Bar */}
      <div className="sticky top-0 z-50 bg-[#FCFADE]">
        <Brand onTitleClick={handleReturnHome} />
        <NavSub />
        <NavMain onViewChange={handleNavChange} />
      </div>

      {/* Main Content */}
      {currentView === "join" ? (
        <JoinUs />
      ) : currentView === "wiki" ? (
        <WikiHome onViewChange={handleWikiNavChange} />
      ) : currentView === "wikiData" ? (
        <WikiData onViewDetail={handleViewDetail} />
      ) : currentView === "wikiDetail" && selectedWikiTitle ? (
        <WikiCard
          title={selectedWikiTitle}
          onBackToList={handleBackToWikiList}
        />
      ) : currentView === "bookclub" ? (
        // Original bookclub functionality
        loading ? (
          <Loading variant="fullPage" />
        ) : (
          <div className="flex flex-col md:flex-row justify-start items-start px-4 md:px-12 lg:px-24 relative">
            {/* Clock and List View */}
            <div className="w-full md:w-auto relative mt-10 hidden md:block">
              {/* Toggle and Controls */}
              <div className="absolute z-10 flex items-center space-x-4 w-full">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={showTable}
                    onCheckedChange={(checked) => {
                      setShowTable(checked);
                    }}
                  />
                  <span
                    className="text-lg font-black text-black cursor-pointer"
                    onClick={() => setShowTable(!showTable)}
                  >
                    {showTable ? "List View" : "Clock View"}
                  </span>
                </div>
              </div>

              {/* Table or Clock */}
              {showTable ? (
                <div>
                  <DataTable data={monthData} onSelect={setSelectedBookData} />
                </div>
              ) : (
                <>
                  <div className="flex flex-col h-auto">
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

            {/* Spacing */}
            <div className="w-8 md:w-16 lg:w-20 flex-shrink-0 h-2 md:h-full"></div>

            {/* Label */}
            <div className="md:flex h-screen hidden">
              <Label />
            </div>

            {/* Content */}
            <div className="w-full md:w-auto mt-8 ml-10 md:mt-0">
              <Content selectedData={selectedBookData} />
            </div>
          </div>
        )
      ) : (
        // Default home page - completely independent
        <div className="flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {/* Current Semester Information */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-black tracking-wide">
                PEER TO PEER
              </h1>

              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-black">
                  The Commons Manifesto
                </h2>

                <p className="text-lg md:text-xl text-black/80">
                  Michel Bauwens, Vasilis Kostakis, and
                  <br />
                  Alex Pazaitis
                </p>

                <p className="text-xl md:text-2xl font-medium text-black mt-6">
                  Sept 1 - Sept 30, 2025
                </p>
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-8">
              <Button
                onClick={handleApply}
                size="lg"
                className="text-lg px-12 py-6 h-auto bg-black text-white hover:bg-black/90 transition-all duration-200 transform hover:scale-105"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
