import { Globe } from "lucide-react";
import { Link2 } from "lucide-react";

export default function NavSub() {
  return (
    <div className="flex bg-black h-12 ml-20 mr-20 items-center justify-between">
      <a
        href="/about"
        className="flex text-[#FCFADE] font-semibold text-lg ml-8"
      >
        <Globe className="w-5 h-5 mr-2 mt-1" /> ENGLISH
      </a>
      <a
        href="/join"
        className="flex text-[#FCFADE] font-semibold text-lg mr-6"
      >
        <Link2 className="w-6 h-6 mr-2 mt-1" /> Connect Wallet
      </a>
    </div>
  );
}
