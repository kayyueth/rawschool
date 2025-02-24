import FallingText from "./fallingText";

export default function WikiHome() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FCFADE] px-24 py-12">
      <div className="relative w-full">
        <div className="flex">
          <div>
            <h1 className="absolute text-7xl font-bold z-[5] whitespace-nowrap top-5">
              OpenLex Project
            </h1>
            <p className="text-lg mb-20 max-w-3xl mt-32">
              This project aims to create a collaborative platform for the
              production and organization of academic concepts, preserving their
              complexity and multiplicity while avoiding the monopolization of
              meaning seen in existing dictionary tools.
            </p>
          </div>
          <input type="text" className="w-1/2 h-10 mt-10" />
        </div>
        <FallingText
          text="数位隐私 密码战争 针对性监控 寒蝉效应 特殊訪問"
          fontSize="2.5rem"
          trigger="auto"
          gravity={0.3}
          mouseConstraintStiffness={0.4}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-8 w-full max-w-6xl">
        {/* Latest Entries */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6">Latest Entries</h2>
          <div className="space-y-4">
            <p className="text-gray-600">Coming soon...</p>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6">Popular Topics</h2>
          <div className="space-y-4">
            <p className="text-gray-600">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
