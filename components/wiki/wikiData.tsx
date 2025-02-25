import React, { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ConceptCard {
  id: number;
  title: string;
  frontContent: string;
  backContent: string;
  author: string;
  source: string;
}

const sampleCards: ConceptCard[] = [
  {
    id: 1,
    title: "数位隐私",
    frontContent:
      "数位隐私是指在数字环境中保护个人信息免受未授权访问、收集、使用、披露或销毁的权利。",
    backContent:
      "现代社会的数位隐私面临着前所未有的挑战。大数据分析、物联网设备和社交媒体的广泛使用使得个人信息更容易被收集和分析。法律框架如GDPR和CCPA试图通过赋予用户对其数据的控制权来应对这些挑战。",
    author: "刘明",
    source: "《数字时代的隐私保护》，2023",
  },
  {
    id: 2,
    title: "针对性监控",
    frontContent:
      "针对性监控是指政府或组织对特定个人或群体进行有选择性的跟踪和监视，通常基于其特征、行为或风险评估。",
    backContent:
      '随着技术的发展，针对性监控变得越来越精细和无形。面部识别、行为分析和预测算法使得监控系统能够主动识别"可疑"个体。这种做法引发了关于歧视性执法和对少数群体过度监控的担忧。',
    author: "张华",
    source: "《监控社会与公民自由》，2022",
  },
  {
    id: 3,
    title: "寒蝉效应",
    frontContent:
      "寒蝉效应指的是当个人因担心受到惩罚或负面后果而抑制或改变自己的言行的现象，特别是在言论自由和自我表达方面。",
    backContent:
      "在全面监控的环境中，寒蝉效应会导致公民自我审查，即使没有明确的限制法规。研究表明，当人们意识到自己被监视时，会显著减少对敏感或争议话题的讨论，从而抑制社会对话和民主参与的活力。",
    author: "李强",
    source: "《数字时代的言论自由》，2021",
  },
  {
    id: 4,
    title: "密码战争",
    frontContent:
      "密码战争是指政府、执法机构与科技公司和隐私倡导者之间关于加密技术在商业产品中使用的持续争论。",
    backContent:
      '密码战争的核心是安全与隐私之间的权衡。政府主张需要"后门"进入加密系统以打击犯罪和恐怖主义，而密码学家和隐私专家则警告，任何故意的漏洞都会被恶意行为者利用，从而削弱所有人的安全。',
    author: "王建",
    source: "《加密与国家安全》，2020",
  },
  {
    id: 5,
    title: "特殊訪問",
    frontContent:
      "特殊訪問是指政府或执法机构通过法律手段或技术方法获取受保护或加密数据的能力和过程。",
    backContent:
      '特殊訪問机制引发了关于谁能合法获取个人通信的问题。各国采取不同的法律框架来平衡国家安全需求与公民隐私权。最具争议的问题之一是政府能否强制技术公司创建"后门"以访问加密数据。',
    author: "陈静",
    source: "《数字安全的法律边界》，2023",
  },
];

const flipCardStyles = `
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .transform-style-3d {
    transform-style: preserve-3d;
  }
  
  .backface-hidden {
    backface-visibility: hidden;
  }
  
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
`;

const FlipCard = ({ card }: { card: ConceptCard }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <>
      <style jsx global>
        {flipCardStyles}
      </style>
      <div
        className="h-[400px] w-full perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* card front */}
          <div className="absolute w-full h-full backface-hidden bg-[#FCFADE] rounded-lg shadow-xl p-6 flex flex-col border border-black">
            <h3 className="text-2xl font-bold border-b-2 border-black pb-2">
              {card.title}
            </h3>
            <p className="text-lg mt-4 flex-grow">{card.frontContent}</p>
            <div className="mt-4 text-sm text-black/60">
              <p>Click to view more</p>
            </div>
          </div>

          {/* card back */}
          <div className="absolute w-full h-full backface-hidden bg-black text-white rounded-lg shadow-xl p-6 rotate-y-180 flex flex-col">
            <h3 className="text-2xl font-bold border-b-2 border-white pb-2">
              {card.title}
            </h3>
            <p className="text-lg mt-4 flex-grow">{card.backContent}</p>
            <div className="mt-4 text-sm">
              <p>作者: {card.author}</p>
              <p>来源: {card.source}</p>
              <p className="mt-2">Click to return</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function WikiData() {
  return (
    <div className="min-h-screen bg-[#FCFADE] px-24 py-12">
      <div className="flex flex-col items-center">
        <h1 className="text-6xl font-bold mb-8 mt-12">AmbiNet Database</h1>
        <p className="text-3xl mb-12 w-2/3 text-center text-black/60">
          Based on the data generated through daily operations, we explore how
          to create a sustainable collaborative platform and assistive tools for
          contemporary humanities researchers, writers, and enthusiasts—a GitHub
          for humanities scholars.
        </p>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div>
            <input
              type="text"
              className="w-[400px] border border-black rounded-md p-2 bg-[#FCFADE]"
              placeholder="Search by concept name or contributor..."
            />
          </div>
          <div>
            <select className="w-[100px] h-[40px] border border-black rounded-md p-2 bg-[#FCFADE]">
              <option value="books">One-line Definition</option>
              <option value="articles">Para-graph Explanation</option>
            </select>
          </div>
          <button className="w-[100px] h-[40px] bg-black text-white font-black text-sm rounded-md hover:bg-black/60">
            Search
          </button>
        </div>
      </div>

      {/* result area - add Carousel */}
      <div className="mt-24 mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Selected Concepts
        </h2>
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent className="-ml-4">
            {sampleCards.map((card) => (
              <CarouselItem key={card.id} className="pl-4 md:basis-1/3">
                <FlipCard card={card} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8">
            <CarouselPrevious className="mr-4 relative position-static" />
            <CarouselNext className="relative position-static" />
          </div>
        </Carousel>
      </div>
    </div>
  );
}
