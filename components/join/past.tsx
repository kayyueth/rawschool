import Link from "next/link";
import { Newspaper } from "lucide-react";
import { Scale } from "lucide-react";

export default function Past() {
  return (
    <div className="w-full h-[600px] overflow-auto">
      {/* Title */}
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

      {/* Content */}
      <div className="mt-8 grid grid-cols-2 gap-14">
        {/* Study Room */}
        <div className="">
          <h2 className="text-4xl mb-2">Study Room</h2>
          <p>2023 Oct - 2023 Nov</p>
          <p className="mt-2 text-xl border-b-2 border-gray-300 pb-4">
            A co-learning initiative where members explore both crypto and
            humanities topics. To join, participants submit a study plan with at
            least one focus from each domain, along with their learning
            frequency and preferred output format.
          </p>
          <p className="mt-4 text-lg font-bold mb-1">
            Thesis topics including ...
          </p>
          <li className="text-lg italic">
            Between the Virtual and the Real: The Trinity of Software, Hardware,
            and Algorithms
          </li>
          <li className="text-lg italic">AW ZK and Fully On-Chain Games</li>
          <li className="text-lg italic">
            Two Questions, Two Concepts, Two Tenses, Fifty Lashes (Public Goods
            or Commons)
          </li>
          <li className="text-lg italic">A Brief Study of MakerDAO</li>
          <li className="text-lg italic">Zuzalu: A Visionary Community</li>
        </div>

        {/* Reading Group */}
        <div className="">
          <h2 className="text-4xl mb-1">Reading Group</h2>
          <p>2024 Jan - 2024 Apr</p>
          <p className="mt-2 text-xl border-b-2 border-gray-300 pb-4">
            A co-reading initiative to explore classic books at the intersection
            of crypto and humanities. Each session, a participant leads the
            discussion by presenting insights from the reading, followed by a
            group conversation to deepen understanding.
          </p>
          <p className="mt-4 text-lg font-bold mb-1">
            Reading list including ...
          </p>
          <li className="text-lg italic">
            <a
              href="https://www.youtube.com/watch?v=7uukwaqYqOE&t=8s"
              className="hover:text-blue-500 mr-2"
            >
              The Sovereign Individual
            </a>
            (Reader: Big Song)
          </li>
          <li className="text-lg italic">
            <a
              href="https://www.youtube.com/watch?v=TdHEO7Pkgiw"
              className="hover:text-blue-500 mr-2"
            >
              Radical Markets
            </a>
            (Reader: Twone)
          </li>
          <li className="text-lg italic">
            Bitcoin: A Peer-to-Peer Electronic Cash System (Reader: Ada)
          </li>
          <li className="text-lg italic">
            Cypherpunks: Freedom and the Future of the Internet (Reader: Atlas)
          </li>
        </div>

        {/* Guest Lecture */}
        <div className="mt-4">
          <h2 className="text-4xl mb-1">Guest Lecture</h2>
          <p>2024 Jan - 2024 Apr</p>
          <p className="mt-2 text-xl border-b-2 border-gray-300 pb-4">
            A series that invites thinkers and builders of related fields to
            share insights on their work.
          </p>
          <p className="mt-4 text-lg font-bold mb-1">
            Guest list including ...
          </p>
          <li className="text-lg italic">
            <a
              href="https://www.youtube.com/watch?v=BeI8Bdq1SRY"
              className="hover:text-blue-500 mr-2"
            >
              Artistic Research
            </a>
            (Guest: Fangting)
          </li>
          <li className="text-lg italic">
            <a
              href="https://www.youtube.com/watch?v=Ql7xpKsnThY"
              className="hover:text-blue-500 mr-2"
            >
              The Probility of A Bitcoin Attack
            </a>
            (Guest: cyber pigeon)
          </li>
          <li className="text-lg italic">
            Mining Industry and Mining Pool (Guest: cyber pigeon)
          </li>
        </div>

        {/* Debate Competition */}
        <div>
          <h2 className="text-4xl mb-1">Debate Competition</h2>
          <p>2024 Apr - 2024 May</p>
          <p className="mt-2 text-xl border-b-2 border-gray-300 pb-4">
            A Debate Competition that challenges participants to engage in
            critical discussions on technology ethics and the future of
            innovation.
          </p>
          <p className="mt-4 text-lg font-bold mb-1">
            Debate topics including ...
          </p>
          <li className="text-lg italic">
            <a
              href="https://www.youtube.com/watch?v=L7zGv6tf_Eg"
              className="hover:text-blue-500 mr-2"
            >
              The Ethics of Progress: e/acc, d/acc, or a Middle Path?{" "}
            </a>
            (Host: Wingo, Debators: Fangting, Yihan, Twone, Haotian, Jiang, Ren)
          </li>
        </div>

        {/* Joint Event */}
        <div>
          <h2 className="text-4xl mb-1">Joint Event</h2>
          <p>2024 Mar - 2024 May</p>
        </div>
        {/* Research Team */}
        <div>
          <h2 className="text-4xl mb-1">Research Team</h2>
          <p>2024 Jul - 2024 Sep</p>
        </div>
        {/* Bookclub Activity */}
        <div>
          <h2 className="text-4xl mb-1">Bookclub Activity</h2>
          <p>2025 Feb - Ongoing </p>
        </div>
        {/* Product Development */}
        <div>
          <h2 className="text-4xl mb-1">Product Development</h2>
          <p>2025 Feb - Ongoing </p>
        </div>
      </div>
    </div>
  );
}
