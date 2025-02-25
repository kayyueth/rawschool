import FallingText from "./fallingText";

export default function WikiHome() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FCFADE] px-24 py-12">
      {/* Top Section - Split into Two Columns */}
      <div className="flex justify-between mb-20">
        {/* Left Column - Title and Animation */}
        <div className="relative w-1/2">
          <div className="flex">
            <h1 className="absolute text-7xl font-bold z-[5] whitespace-nowrap top-5">
              OpenLex Project
            </h1>
            <h2 className="absolute text-4xl top-28 text-black/20 font-bold">
              Decentralizing Meaning, <br />
              Preserving Complexity.
            </h2>
          </div>
          <div className="mt-40">
            <FallingText
              text="数位隐私 密码战争 针对性监控 寒蝉效应 特殊訪問"
              fontSize="1.5rem"
              trigger="auto"
              gravity={0.1}
              mouseConstraintStiffness={0.4}
            />
          </div>
        </div>

        {/* Right Column - Project Info */}
        <div className="w-1/2 pt-5 pl-20">
          <div className="space-y-6">
            <div className="flex justify-between">
              <h3 className="text-lg font-bold mb-1">Timeline</h3>
              <p className="text-lg mr-60">Feb 2025 - Present</p>
            </div>
            <div className="flex justify-between">
              <h3 className="text-lg font-bold mb-1">Initiator</h3>
              <p className="text-lg mr-60">7k, Kay</p>
            </div>
            <div className="flex justify-between">
              <h3 className="text-lg font-bold mb-1">Audience</h3>
              <p className="text-lg mr-60">Academia</p>
            </div>
            <div className="flex justify-between">
              <h3 className="text-lg font-bold mb-1">Data Source</h3>
              <p className="text-lg mr-60">Raw School Bookclub</p>
            </div>
            <div className="flex justify-between">
              <h3 className="text-lg font-bold mb-1">Tech Stack</h3>
              <p className="text-lg mr-60">Arweave, Bundler</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Project Details */}
      <div className="w-1/2">
        <div className="text-lg mb-10 border-t-2 border-black pt-6">
          <h3 className="font-bold">Project Details</h3>
          <p className="w-full">
            Based on the data generated through daily operations, we explore how
            to create a sustainable collaborative platform and assistive tools
            for contemporary humanities researchers, writers, and enthusiasts—a
            GitHub for humanities scholars.
          </p>
        </div>
        <div className="text-lg mb-20 border-t-2 border-black pt-6">
          <h3 className="font-bold">Project Details</h3>
          <p className="">
            The foundation of computer engineering is code, while the foundation
            of humanities research is concepts—rigorously defined, rich in
            meaning, and meticulously sourced concepts serve as the very
            building blocks of humanities writing. Based on this premise, this
            product will focus on the collaborative production and organization
            of concepts: imagine being able to quickly and accurately locate the
            meaning and sources of a particular academic concept; imagine being
            able to trace how the same term takes on different meanings across
            various works, authors, and disciplines; imagine if the bulk of a
            humanities scholar's work—literature reviews, conceptual analysis,
            reading notes—could be preserved and shared rather than discarded
            like worn-out scraps.
          </p>
          <p className="mt-6">
            How does this differ from existing tools such as Wikipedia and other
            collaborative dictionary platforms designed for humanities scholars?
            In truth, any dictionary that deals with humanities concepts must
            confront the inherent tension between specialization and the
            polysemy (poetic ambiguity) of terms. Existing tools attempt to
            ensure scholarly rigor by appointing entry curators or inviting
            experts to author definitions, but in practice, this results in a
            monopoly over meaning, diminishing the diversity that is the
            hallmark of the humanities. This approach, rooted in a mass-media
            mindset that seeks to eliminate "ambiguity," ultimately leads to
            intellectual homogenization—a phenomenon that should be viewed with
            caution, both in academic discourse and in everyday language.
          </p>
        </div>
      </div>
    </div>
  );
}
