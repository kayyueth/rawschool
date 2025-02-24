"use client";

interface NavMainProps {
  onViewChange?: (view: "book" | "reviews" | "join" | "wiki") => void;
}

export default function NavMain({ onViewChange }: NavMainProps) {
  return (
    <div className="flex ml-20 mr-20 mt-4 justify-between text-xl border-b-2 border-black">
      <div className="mb-4">
        <button onClick={() => onViewChange?.("book")} className="ml-8">
          Bookclub Calender
        </button>
        <button onClick={() => onViewChange?.("wiki")} className="ml-8">
          DeSci Wiki
        </button>
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
