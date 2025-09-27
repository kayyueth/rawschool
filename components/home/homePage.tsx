"use client";

import ScrambledText from "./ScrambledText";

export default function HomePage() {
  return (
    <div className="px-4 md:ml-20 md:mr-20">
      <div className="">
        {/* Current Semester Information */}
        <div className="space-y-6 text-xl">
          {/* Semester Enrollment Message */}
          <div className="text-2xl text-center bg-black text-[#FCFADE] font-semibold p-4 hidden">
            ⧗ Semester 04 enrollment coming soon!
          </div>

          {/*Time and Captain Information*/}
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <h3 className="text-xl md:text-6xl font-medium text-black">
                <ScrambledText
                  className="scrambled-text-demo"
                  radius={100}
                  duration={1.5}
                  speed={0.1}
                  scrambleChars=".:"
                >
                  Sept 1 - Sept 30, 2025
                </ScrambledText>
              </h3>
              <p className="text-xl md:text-2xl self-end mt-6">
                <ScrambledText
                  className="scrambled-text-demo"
                  radius={100}
                  duration={1.5}
                  speed={0.1}
                  scrambleChars=".:"
                >
                  20h/21h
                </ScrambledText>
              </p>
            </div>
          </div>

          {/*Authors*/}
          <p className="text-lg md:text-4xl text-black/80">
            <ScrambledText
              className="scrambled-text-demo"
              radius={100}
              duration={1.5}
              speed={0.1}
              scrambleChars=".:"
            >
              Michel Bauwens, Vasilis Kostakis, and
              <br />
              Alex Pazaitis
            </ScrambledText>
          </p>

          {/*Title*/}
          <div className="flex gap-4">
            <h1 className="text-3xl md:text-[120px] font-black leading-none">
              <ScrambledText
                className="scrambled-text-demo"
                radius={100}
                duration={1.5}
                speed={0.1}
                scrambleChars=".:"
              >
                PEER TO PEER
              </ScrambledText>
            </h1>
            <div className="space-y-4">
              <h2 className="text-2xl md:text-[120px] font-bold leading-none">
                <ScrambledText
                  className="scrambled-text-demo"
                  radius={100}
                  duration={1.5}
                  speed={0.1}
                  scrambleChars=".:"
                >
                  The Commons Manifesto
                </ScrambledText>
              </h2>
            </div>
          </div>

          <p className="text-lg md:text-2xl text-black/80">
            <ScrambledText
              className="scrambled-text-demo"
              radius={20}
              duration={1.5}
              speed={0.1}
              scrambleChars=".:"
            >
              The peer-reviewed book series edited by Christian Fuchs publishes
              books that critically study the role of the internet and digital
              and social media in society. Titles analyse how power structures,
              digital capitalism, ideology and social struggles shape and are
              shaped by digital and social media. They use and develop critical
              theory discussing the political relevance and implications of
              studied topics. The series is a theoretical forum for internet and
              social media research for books using methods and theories that
              challenge digital positivism; it also seeks to explore digital
              media ethics grounded in critical social theories and philosophy.
            </ScrambledText>
          </p>
        </div>
      </div>
    </div>
  );
}
