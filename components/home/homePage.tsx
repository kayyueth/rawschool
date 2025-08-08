"use client";

import { Button } from "@/components/ui/button";

interface HomePageProps {
  onApply: () => void;
  isHeaderCollapsed?: boolean;
}

export default function HomePage({
  onApply,
  isHeaderCollapsed = false,
}: HomePageProps) {
  return (
    <div className="px-4 py-12 md:ml-20 md:mr-20">
      <div className="">
        {/* Current Semester Information */}
        <div className="space-y-6">
          {/*Time and Captain Information*/}
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <h3 className="text-xl md:text-6xl font-medium text-black">
                Sept 1 - Sept 30, 2025
              </h3>
              <p className="text-xl md:text-2xl self-end mt-6">20h/21h</p>
            </div>
            {isHeaderCollapsed ? (
              <div className="flex items-center">
                <img
                  src="/Logo.svg"
                  alt="Logo"
                  className="h-20 md:h-20 w-auto"
                />
              </div>
            ) : null}
          </div>

          {/*Authors*/}
          <p className="text-lg md:text-4xl text-black/80">
            Michel Bauwens, Vasilis Kostakis, and
            <br />
            Alex Pazaitis
          </p>

          {/*Title*/}
          <div className="flex gap-4">
            <h1 className="text-3xl md:text-[120px] font-black leading-none">
              PEER TO PEER
            </h1>
            <div className="space-y-4">
              <h2 className="text-2xl md:text-[120px] font-bold leading-none">
                The Commons Manifesto
              </h2>
            </div>
          </div>

          <p className="text-lg md:text-2xl text-black/80">
            The peer-reviewed book series edited by Christian Fuchs publishes
            books that critically study the role of the internet and digital and
            social media in society. Titles analyse how power structures,
            digital capitalism, ideology and social struggles shape and are
            shaped by digital and social media. They use and develop critical
            theory discussing the political relevance and implications of
            studied topics. The series is a theoretical forum for internet and
            social media research for books using methods and theories that
            challenge digital positivism; it also seeks to explore digital media
            ethics grounded in critical social theories and philosophy.
          </p>
        </div>

        {/* Apply Button */}
        <div className="text-right pt-8">
          <Button
            onClick={onApply}
            size="lg"
            className="text-lg px-12 py-6 h-auto bg-black text-white hover:bg-black/90 transition-all duration-200 transform hover:scale-105"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
