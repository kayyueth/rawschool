import FallingText from "./fallingText";
import { MoveRight } from "lucide-react";
import { useState, Dispatch, SetStateAction } from "react";

interface WikiHomeProps {
  onViewChange?: Dispatch<
    SetStateAction<
      "book" | "reviews" | "join" | "wiki" | "wikiData" | "wikiDetail"
    >
  >;
}

export default function WikiHome({ onViewChange }: WikiHomeProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FCFADE] px-24 py-12">
      {/* Top Section - Split into Two Columns */}
      <div className="flex justify-between mb-20">
        {/* Left Column - Title and Animation */}
        <div className="relative w-1/2">
          <div className="flex">
            <h1 className="absolute text-7xl font-bold z-[5] whitespace-nowrap top-5">
              AmbiNet Project
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
          <div className="space-y-2">
            <div className="flex justify-between border-b-2 border-black/20 pb-2">
              <h3 className="text-lg font-black text-black/20">Timeline</h3>
              <p className="text-lg">Feb 2025 - Present</p>
            </div>
            <div className="flex justify-between border-b-2 border-black/20 pb-2">
              <h3 className="text-lg font-black text-black/20">Initiator</h3>
              <p className="text-lg">7k, Kay</p>
            </div>
            <div className="flex justify-between border-b-2 border-black/20 pb-2">
              <h3 className="text-lg font-black text-black/20">Audience</h3>
              <p className="text-lg">Academia</p>
            </div>
            <div className="flex justify-between border-b-2 border-black/20 pb-2">
              <h3 className="text-lg font-black text-black/20">Data Source</h3>
              <p className="text-lg">Raw School Bookclub</p>
            </div>
            <div className="flex justify-between border-b-2 border-black/20 pb-2">
              <h3 className="text-lg font-black text-black/20">Tech Stack</h3>
              <p className="text-lg">Arweave, Bundler</p>
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="text-3xl font-black mt-10"
                onClick={() => onViewChange && onViewChange("wikiData")}
              >
                Click to Enter
              </button>
              <MoveRight className="w-10 h-10 mt-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Project Details */}
      <div className="text-lg mb-20 border-t-2 border-black pt-6 flex gap-20">
        {/* Left Column - Background */}
        <div className="w-1/2">
          <h3 className="font-bold text-2xl text-black/20">BACKGROUND</h3>
          <p className="mt-2 text-2xl">
            The foundation of computer engineering is{" "}
            <span className="font-bold">code</span>, while the foundation of
            humanities research is <span className="font-bold">concepts</span>
            —rigorously defined, rich in meaning, and meticulously sourced
            concepts serve as the very building blocks of humanities writing.
            Based on this premise, this product will focus on the{" "}
            <span className="font-bold">
              collaborative production and organization of concepts
            </span>
            : imagine being able to quickly and accurately locate the meaning
            and sources of a particular academic concept; imagine being able to
            trace how the same term takes on different meanings across various
            works, authors, and disciplines; various works, authors, and
            disciplines; imagine if the bulk of a humanities scholar's
            work—literature reviews, conceptual analysis, reading notes—could be
            preserved and shared rather than discarded like worn-out scraps.
          </p>
          <p className="mt-6 text-2xl">
            How does this differ from existing tools such as Wikipedia and other
            collaborative dictionary platforms designed for humanities scholars?
            In truth, any dictionary that deals with humanities concepts must
            confront the inherent tension between specialization and the{" "}
            <span className="font-bold">
              polysemy (poetic ambiguity) of terms
            </span>
            . Existing tools attempt to ensure scholarly rigor by appointing
            entry curators or inviting experts to author definitions, but in
            practice, this results in a monopoly over meaning, diminishing the
            diversity that is the hallmark of the humanities. This approach,
            rooted in a mass-media mindset that seeks to eliminate "ambiguity,"
            ultimately leads to{" "}
            <span className="font-bold">intellectual homogenization</span>, a
            phenomenon that should be viewed with caution, both in academic
            discourse and in everyday language.
          </p>
          <h3 className="mt-6 font-bold text-2xl text-black/20">HOW TO JOIN</h3>
          <p className="mt-2 text-2xl">
            We are looking for{" "}
            <span className="font-bold">
              scholars, writers, coders, and knowledge enthusiasts
            </span>{" "}
            to help us:
            <br />
            <br />
            📖 Contribute definitions and citations from sources
            <br />
            🧠 Build knowledge graphs that visualize conceptual relationships
            <br />
            💾 Develop the infrastructure for decentralized knowledge
            preservation
            <br />
            <br />
            If you believe meaning should be{" "}
            <span className="font-bold">
              open, collaborative, and resilient
            </span>
            , join us in shaping a GitHub for the Humanities. <br />
            <br />
            <span className="font-bold">🔗 Get involved:</span>{" "}
            SevenKthousand@protonmail.com
          </p>
        </div>
        {/* Right Column - Project Details */}
        <div className="w-1/2">
          <h3 className="font-bold text-2xl text-black/20">PRODUCT DESIGN</h3>
          <p className="mt-2 text-2xl">
            Through product design, we believe we can provide a tool better
            suited for{" "}
            <span className="font-bold">
              scholarship, communication, and poetic expression
            </span>
            . This tool will be composed of the following three main components:
          </p>
          <h3 className="mt-6 font-bold text-2xl text-black/20">CONTENT:</h3>
          <p className="mt-2 text-2xl">
            Concepts will be linked to books or academic literature (with the
            potential to gradually expand to include web pages, videos, and
            other sources). Contributors must submit the{" "}
            <span className="font-bold">DOI/ISBN number</span> of the referenced
            book or document and provide the corresponding page number for{" "}
            <span className="font-bold">citations</span> (other academic
            citation formats can be automatically generated by the system).
            Users can contribute two types of entries:
          </p>
          <li className="mt-2 text-2xl font-bold">
            One-line (concise definitions)
          </li>
          <li className="mb-2 text-2xl font-bold">
            Para-graph (parallel reflections)
          </li>
          <p className="mt-2 text-2xl">
            <span className="font-bold">One-line entries</span> involve directly
            extracting the author's explicit definition of a concept from the
            text, while <span className="font-bold">Para-graph entries</span>{" "}
            allow contributors to interpret and elaborate on the original
            definition. <span className="font-bold">One-line entries</span> are
            not strictly limited to a single line, and{" "}
            <span className="font-bold">Para-graph entries</span> are not
            confined to a single paragraph.
          </p>
          <h3 className="mt-6 font-bold text-2xl text-black/20">
            AI-Generated Baseline Entries:
          </h3>
          <p className="mt-2 text-2xl">
            The system will generate{" "}
            <span className="font-bold">AI-assisted baseline entries</span> for
            comparison. AI will serve both as a reference to support entry
            writing and comprehension and as a means to address the{" "}
            <span className="font-bold">cold start problem</span> in the
            database. Additionally, this design will serve as a{" "}
            <span className="font-bold">long-term experiment</span> to assess
            the claim that "AI will replace the humanities."
          </p>
          <h3 className="mt-6 font-bold text-2xl text-black/20">
            Credibility & Evaluation System:
          </h3>
          <p className="mt-2 text-2xl">
            The tool will experiment with{" "}
            <span className="font-bold">
              collaborative citation verification
            </span>
            , allowing users to collectively verify references within entries.
          </p>
          <li className="mt-2 text-2xl">
            Since this is an internal test phase, we will not initially consider{" "}
            <span className="font-bold">counter measures</span> for malicious
            edits or spam entries.
          </li>
          <li className="mt-2 text-2xl">
            In the final version, we may adopt a{" "}
            <span className="font-bold">social wiki</span> model, where
            moderation is based on user reputation, social context, and a trust
            system.
          </li>
        </div>
      </div>
    </div>
  );
}
