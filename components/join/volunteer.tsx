import Link from "next/link";
import { Newspaper } from "lucide-react";
import { Scale } from "lucide-react";
import { Youtube } from "lucide-react";

export default function Volunteer() {
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
      <div className="mt-8 border-b-2 border-gray-200 pb-8">
        <h2 className="text-3xl mb-2">Volunteer Opprtunity</h2>
        <p className="text-2xl mb-4">
          Raw School is seeking passionate volunteer
          <span className="font-bold"> Teaching Assistants (TAs)</span> to
          support our peer-to-peer learning community. As a TA, you will play a
          vital role in facilitating discussions, guiding reading groups, and
          fostering intellectual exchange within our interdisciplinary learning
          environment.
        </p>

        <div className="md:flex justify-between gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl mb-2">Responsibilities</h2>
            <li className="text-xl">
              <span className="font-bold">Discussion Facilitator:</span> Assist
              in organizing and moderating weekly Zoom reading discussions.
            </li>
            <li className="text-xl">
              <span className="font-bold">Learning Guide:</span> Provide
              learning support by helping participants structure their reading
              plans and discussions.
            </li>
            <li className="text-xl">
              <span className="font-bold">Knowledge Curator:</span> Review and
              give feedback on Reading Notes to enhance knowledge-sharing.
            </li>
            <li className="text-xl">
              <span className="font-bold">Wiki Contributor:</span> Contribute to
              the product development of Raw School's Wiki database.
            </li>
          </div>

          <div className="md:w-1/2">
            <h2 className="text-3xl mb-2 mt-2 md:mt-0">Benefits</h2>
            <li className="text-xl">
              <span className="font-bold">Stake-Free Participation:</span> TAs
              are exempt from staking requirements and can participate in all
              learning activities.
            </li>
            <li className="text-xl">
              <span className="font-bold">Priority Access:</span> Gain priority
              admission to Raw School’s exclusive events, workshops, and speaker
              sessions.
            </li>
            <li className="text-xl">
              <span className="font-bold">Community Recognition:</span> Receive
              an official TA certificate SBT and Uncommons membership, granting
              deeper involvement in the community.
            </li>
            <li className="text-xl">
              <span className="font-bold">Skill Development:</span> Enhance your
              facilitation, research, and knowledge-sharing skills while
              engaging with a diverse group of thinkers.
            </li>
          </div>
        </div>
      </div>

      {/* Donation & Support */}
      <div className="md:mt-12 mt-6 border-b-2 border-gray-200 pb-12">
        <h2 className="text-3xl mb-2">Donation & Support</h2>
        <p className="text-2xl mb-4">
          Raw School is a{" "}
          <span className="font-bold">non-profit organization</span> that relies
          on the generosity of our community to continue its work. If you would
          like to support our mission, please consider making a donation. ✨🌿📖
        </p>
        <div className="md:flex justify-between">
          <img src="/garden.png" alt="donation" className="md:w-1/2 mt-6" />
          <div className="flex flex-col gap-2 mt-6 mr-20 text-2xl">
            <div className="flex justify-between gap-16">
              <div>
                <p>Support Raw School:</p>
                <p className="text-sm">
                  eth:0xF124dDC7263518 A96
                  <br />
                  40cE7594dBda1c1ce051F0a
                </p>
              </div>
              <div>
                <img
                  src="/safe_raw.png"
                  alt="rawschool"
                  className="w-10 h-10 mt-2"
                />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <div>
                <p>Support Uncommons:</p>
                <p className="text-sm">
                  eth:0xe48610632d2621aBE9
                  <br />
                  FeA613d54509219D0cB83F
                </p>
              </div>
              <div>
                <img
                  src="/safe_unco.png"
                  alt="uncommons"
                  className="w-10 h-10 mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
