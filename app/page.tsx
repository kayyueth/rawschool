"use client";

import Clock from "@/components/clock/clock";
import Brand from "../components/header/brand";
import NavSub from "../components/header/navSub";
import NavMain from "../components/header/navMain";
import Content from "@/components/bookclub/content";
import Label from "../components/bookclub/label";
import { useState } from "react";

interface BookclubData {
  id: number;
  season: string;
  title: string;
  people: string;
  description: string;
  month: string;
}

export default function Home() {
  const [selectedBookData, setSelectedBookData] = useState<BookclubData | null>(
    null
  );

  return (
    <div className="grid bg-[#FCFADE]">
      <div className="sticky">
        <Brand />
        <NavSub />
        <NavMain />
      </div>
      <div className="flex justify-between items-center">
        <div className="w-[45%]">
          <Clock onDataSelect={setSelectedBookData} />
          <p className="ml-[20%] font-semibold text-center">
            Raw Bookclub Calendar
          </p>
          <p className="ml-[20%] mb-10 text-center">Updated: Feb 6, 2025</p>
        </div>
        <Label />
        <Content selectedData={selectedBookData} />
      </div>
    </div>
  );
}
