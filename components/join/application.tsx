import Link from "next/link";
import { Newspaper } from "lucide-react";
import { Scale } from "lucide-react";
import { Youtube } from "lucide-react";
import { ChevronsLeft } from "lucide-react";
import { ChevronsRight } from "lucide-react";

export default function Application() {
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
        <Link
          href="https://www.youtube.com/playlist?list=PLb3KKuZ5u5Ezoo1wP8w_LSG6YAJY6q8Vq"
          target="_blank"
          className="mt-3"
        >
          <Youtube className="cursor-pointer hover:text-blue-500" />
        </Link>
      </div>

      {/* Content */}
      <div className="mt-8">
        {/* Registration Process */}
        <div className="mb-8 border-b-2 border-gray-200 pb-8">
          <h2 className="text-3xl font-bold mb-2">Registration Process</h2>
          <p className="text-2xl mb-4">
            The reading group operates on a rolling basis with a one-month
            cycle. Participants can find the application portal on public
            platforms and register via Luma by filling out the following
            details:
          </p>
          <li className="text-xl">
            <span className="font-bold">Personal Information:</span> Describe
            yourself in five keywords.
          </li>
          <li className="text-xl">
            <span className="font-bold">Email Address:</span> For notifications
            and contact purposes.
          </li>
          <li className="text-xl">
            <span className="font-bold">Stake Amount:</span> Self-determined
            stake amount.
          </li>
          <li className="text-xl">
            <span className="font-bold">Recommended Reads:</span> Your three
            favorite books and the reasons you love them.
          </li>
          <li className="text-xl">
            <span className="font-bold">Planned Reads:</span> The books you
            intend to read for the month.
          </li>
        </div>

        {/* Participation Mechanism */}
        <div className="mb-8 border-b-2 border-gray-200 pb-8">
          <h2 className="text-3xl font-bold mb-2">Participation Mechanism</h2>
          <li className="text-xl">
            <span className="font-bold">Team Formation:</span> Upon acceptance,
            participants will join a group for the month’s activities. Teams can
            choose their own names and will be grouped based on book genres
            rather than reading the same book.
          </li>
          <li className="text-xl">
            <span className="font-bold">Co-Reading Sessions:</span> Participants
            will engage in cyber reading spaces on Zoom, with mandatory weekly
            group discussions.
          </li>
          <li className="text-xl">
            <span className="font-bold">Reading Notes Submission:</span> Each
            participant must submit Reading Notes, which will be recorded in
            Raw’s database as part of a shared knowledge repository.
          </li>
          <li className="text-xl">
            <span className="font-bold">Wiki Contribution:</span> Participants
            can contribute to building Raw School’s Wiki, creating and reviewing
            entries as a collaborative humanities initiative.
          </li>
        </div>

        {/* Incentive Mechanism */}
        <div className="mb-8 border-b-2 border-gray-200 pb-8">
          <h2 className="text-3xl font-bold mb-2">Incentive Mechanism</h2>
          <p className="text-2xl mb-4">
            Graduation Rewards: Participants who meet attendance and output KPIs
            will graduate with honors and receive the following rewards:
          </p>
          <li className="text-xl">
            <span className="font-bold">Stake Refund & Bonus:</span> The staked
            amount will be refunded.
          </li>
          <li className="text-xl">
            <span className="font-bold">Raw Graduation Certificate:</span> A
            token of completion and contribution.
          </li>
          <li className="text-xl">
            <span className="font-bold">Uncommons Official Membership:</span>
            Graduates will be promoted to full community members, unlocking more
            privileges and opportunities for participation.
          </li>
        </div>

        {/* Sign Up */}
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <ChevronsLeft className="w-8 h-8" />
            <h3 className="text-2xl font-bold">
              <a
                href="https://tally.so/r/nPG1Jx"
                target="_blank"
                className="hover:text-blue-600"
              >
                Click to Apply
              </a>
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-bold">
              <a
                href="https://tally.so/r/nPG1Jx"
                target="_blank"
                className="hover:text-blue-600"
              >
                Click to Subscribe
              </a>
            </h3>
            <ChevronsRight className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
