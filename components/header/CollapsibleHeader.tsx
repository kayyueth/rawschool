"use client";

import Brand from "./brand";
import NavSub from "./navSub";
import NavMain from "./navMain";

interface CollapsibleHeaderProps {
  onViewChange?: (view: "book" | "reviews" | "join" | "wiki") => void;
  onTitleClick?: () => void;
}

export default function CollapsibleHeader({
  onViewChange,
  onTitleClick,
}: CollapsibleHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#FCFADE]">
      <Brand onTitleClick={onTitleClick} />
      <NavSub />
      <NavMain onViewChange={onViewChange} />
    </div>
  );
}
