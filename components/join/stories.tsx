import { Twitter } from "lucide-react";
import { AppWindow } from "lucide-react";
import { Newspaper } from "lucide-react";
import { FileText } from "lucide-react";
import { Send } from "lucide-react";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function Stories() {
  return (
    <div className="mt-8 w-full h-[600px] overflow-auto">
      <div className="flex gap-4 mb-8">
        <Link href="https://x.com/un__commons" target="_blank">
          <Twitter className="cursor-pointer hover:text-blue-500" />
        </Link>
        <Link href="https://uncommons.cc" target="_blank">
          <AppWindow className="cursor-pointer hover:text-blue-500" />
        </Link>
        <Link href="https://www.notion.site/uncommons" target="_blank">
          <Newspaper className="cursor-pointer hover:text-blue-500" />
        </Link>
        <Link href="https://blog.uncommons.cc/" target="_blank">
          <FileText className="cursor-pointer hover:text-blue-500" />
        </Link>
        <Link href="https://t.me/theuncommons" target="_blank">
          <Send className="cursor-pointer hover:text-blue-500" />
        </Link>
        <Link href="mailto:RealUncommons@gmail.com" target="_blank">
          <Mail className="cursor-pointer hover:text-blue-500" />
        </Link>
      </div>
      <h1 className="text-4xl font-bold mb-4">
        To Think Critically, with Uncommons
      </h1>
      <h2 className="text-4xl mb-10">
        A researcher garden for decentralized thought and techno-social
        philosophies.
      </h2>
      <p className="text-xl mb-12">
        It was previously as GreenPill CN, which consisting a group of Web3
        enthusiasts, society builders and digital citizens who are influenced
        and inspired by GreenPill's ideas. It aims to establish a
        cross-organizational collaboration structure to explore public goods
        governance, build bridges between DAOs, discuss cutting-edge concepts,
        spread and practice regenerated economics, solve coordination failures,
        and reshape a healthy decentralized society.
      </p>

      <img src="map.png" className="w-full h-auto" />

      {/* data points */}
      <div className="md:flex gap-24 mt-12">
        <div>
          <div className="flex gap-4 mb-2">
            <p className="text-4xl font-bold">300+</p>
            <p className="text-xl mt-2">chinese members</p>
          </div>
          <div className="flex gap-4 mb-2">
            <p className="text-4xl font-bold">500+</p>
            <p className="text-xl mt-2">international members</p>
          </div>
          <div className="flex gap-4 mb-2">
            <p className="text-4xl font-bold">3000+</p>
            <p className="text-xl mt-2">social media followers</p>
          </div>
        </div>
        <div>
          <div className="flex gap-4 mb-2">
            <p className="text-4xl font-bold">4</p>
            <p className="text-xl mt-2">published books</p>
          </div>
          <div className="flex gap-4 mb-2">
            <p className="text-4xl font-bold">15+</p>
            <p className="text-xl mt-2">projects funded</p>
          </div>
          <div className="flex gap-4 mb-2">
            <p className="text-4xl font-bold">600+</p>
            <p className="text-xl mt-2">hours of online creation paid</p>
          </div>
        </div>
      </div>
      <p className="text-3xl mt-10 mb-12">2022-2025, Our Story Continues ...</p>
    </div>
  );
}
