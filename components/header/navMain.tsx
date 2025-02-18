"use client";

interface NavMainProps {
  onViewChange?: (view: "book" | "reviews" | "join") => void;
}

export default function NavMain({ onViewChange }: NavMainProps) {
  return (
    <div className="flex ml-20 mr-20 mt-4 justify-between text-xl border-b-2 border-black">
      <div className="mb-4">
        <a href="/" className="ml-8">
          Bookclub Calender
        </a>
        <a href="" className="ml-8">
          DeSci Wiki
        </a>
      </div>

      <div>
        <button
          onClick={() => onViewChange?.("join")}
          className="mr-8 hover:opacity-70 transition-opacity"
        >
          Join Us
        </button>
      </div>
    </div>
  );
}
