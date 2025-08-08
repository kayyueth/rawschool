"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import Brand from "./brand";
import NavSub from "./navSub";
import NavMain from "./navMain";

interface CollapsibleHeaderProps {
  onViewChange?: (view: "book" | "reviews" | "join" | "wiki") => void;
  onTitleClick?: () => void;
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

export default function CollapsibleHeader({
  onViewChange,
  onTitleClick,
  onCollapsedChange,
}: CollapsibleHeaderProps) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed

  // Load collapsed state from localStorage on mount, default to true if not set
  useEffect(() => {
    const savedState = localStorage.getItem("headerCollapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    } else {
      // If no saved state, default to collapsed and save it
      localStorage.setItem("headerCollapsed", "true");
      onCollapsedChange?.(true);
    }
  }, [onCollapsedChange]);

  const toggleHeader = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Save state to localStorage
    localStorage.setItem("headerCollapsed", JSON.stringify(newState));
    // Notify parent component of state change
    onCollapsedChange?.(newState);
  };

  return (
    <div className="sticky top-0 z-50 bg-[#FCFADE]">
      {/* Toggle Button */}
      <div className="flex justify-center">
        <button
          onClick={toggleHeader}
          className="flex items-center justify-center w-12 h-6 bg-black text-white rounded-b-lg hover:bg-black/90 transition-all duration-200 z-10 shadow-lg hover:shadow-xl transform hover:scale-105"
          aria-label={isCollapsed ? "Expand header" : "Collapse header"}
        >
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
          ) : (
            <ChevronUp className="w-4 h-4 transition-transform duration-200" />
          )}
        </button>
      </div>

      {/* Header Content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isCollapsed
            ? "max-h-0 opacity-0 transform -translate-y-2"
            : "max-h-[400px] opacity-100 transform translate-y-0"
        }`}
        style={{
          maxHeight: isCollapsed ? "0px" : "400px",
        }}
      >
        <div
          className={`transition-all duration-500 ease-in-out ${
            isCollapsed ? "opacity-0" : "opacity-100"
          }`}
        >
          <Brand onTitleClick={onTitleClick} />
          <NavSub />
          <NavMain onViewChange={onViewChange} />
        </div>
      </div>
    </div>
  );
}
