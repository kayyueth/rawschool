import Link from "next/link";
import { Scale } from "lucide-react";
import { Newspaper } from "lucide-react";

export default function Project() {
  return (
    <div className="h-[800px]">
      <div className="flex gap-4 mt-8">
        <h1 className="text-5xl font-bold">Raw School</h1>
        <Link
          href="https://www.notion.so/uncommons/Raw-School-6f4023a9f71c42e9aa90c16467aa586b"
          target="_blank"
          className="mt-3"
        >
          <Newspaper className="cursor-pointer hover:text-blue-500" />
        </Link>
        <Link
          href="https://snapshot.box/#/s:0xuncommons.eth/proposal/0xac808888689468fdd0ccbcaf9fca9422084311680439ca38221038c7465883e1"
          target="_blank"
          className="mt-3"
        >
          <Scale className="cursor-pointer hover:text-blue-500" />
        </Link>
      </div>
      <h3 className="text-4xl mt-6">
        An interdisciplinary liberal arts experience on crypto humanities
        through peer-to-peer seminars and collaborative learning
      </h3>
      <div className="flex gap-10">
        <div className="mt-10">
          <img src="/org1.png" alt="Project" />
          <img src="/org2.png" alt="Project" />
        </div>
        <p className="text-lg mt-10 w-[2000px]">
          Raw School was established as a community-incubated workstream and
          piloted within the community in October 2023 under the Playstream (PS)
          format. From October 2023 to May 2024, it successfully ran two
          semesters following the Playstream model, spanning a total of 6+1
          months:
          <br />
          <br />
          <li>The 1st semester focused on a "study room" format.</li>
          <li>The 2nd semester structured around a "reading group" model.</li>
          <br />
          Between semesters, learning continued through debate competitions and
          guest lectures. In 2025, Raw School will undergo a major upgrade,
          introducing blended online and offline short-term programs, developing
          a dedicated online education platform and tools, and seamlessly
          integrating education, research, and product development to expand its
          learning ecosystem.
        </p>
      </div>
    </div>
  );
}
