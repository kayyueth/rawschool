"use client";

import Clock from "../components/clock/clock";
import Brand from "../components/header/brand";
import NavSub from "../components/header/navSub";
import NavMain from "../components/header/navMain";
import Content from "../components/bookclub/content";

export default function Home() {
  return (
    <div className="grid">
      <div className="sticky">
        <Brand />
        <NavSub />
        <NavMain />
      </div>
      <div className="flex justify-between items-center">
        <Clock />
        <Content />
      </div>
    </div>
  );
}
