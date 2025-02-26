"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

// 定义Wiki表项类型
interface WikiItem {
  id: string;
  词条名称: string;
  "定义/解释/翻译校对": string;
  "来源Soucre / 章节 Chapter": string;
  Property: string;
  "人工智能生成 AI-generated": boolean;
  Date: string;
  "Last edited time": string;
  人工智能模型: string | null;
  内容: string;
}

// 调整卡片数据结构以匹配 wiki 表
interface ConceptCard {
  id: string;
  title: string;
  frontContent: string;
  backContent: string;
  author: string;
  source: string;
  type: string;
  aiGenerated: boolean;
}

// 翻转卡片样式
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

const FlipCard = ({
  card,
  onViewDetails,
}: {
  card: ConceptCard;
  onViewDetails: (title: string) => void;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    setIsFlipped(!isFlipped);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    onViewDetails(card.title);
  };

  return (
    <>
      <style jsx global>
        {flipCardStyles}
      </style>
      <div
        className="h-[400px] w-full perspective-1000 cursor-pointer"
        onClick={handleCardClick}
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
              <button
                className="bg-black text-white px-4 py-1 rounded hover:bg-black/70 transition-colors"
                onClick={handleViewDetails}
              >
                查看详情
              </button>
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
              <button
                className="mt-2 bg-white text-black px-4 py-1 rounded hover:bg-white/70 transition-colors"
                onClick={handleViewDetails}
              >
                查看完整内容
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function WikiData() {
  const router = useRouter();

  const [cards, setCards] = useState<ConceptCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<ConceptCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [commandOpen, setCommandOpen] = useState(false);
  const commandRef = React.useRef<HTMLDivElement>(null);

  // 客户端挂载检测
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 处理导航
  const handleNavigate = (title: string) => {
    router.push(`/wiki/${encodeURIComponent(title)}`);
  };

  // 处理文档点击事件关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node)
      ) {
        setCommandOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 处理搜索提交
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredCards(cards);
      return;
    }

    const filtered = cards.filter(
      (card) =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.frontContent.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredCards(filtered);
  };

  // 处理命令项点击
  const handleCommandItemClick = (value: string) => {
    setSearchQuery(value);
    setCommandOpen(false);
    handleNavigate(value);
  };

  // 从 Supabase 获取数据
  useEffect(() => {
    async function fetchWikiData() {
      try {
        setIsLoading(true);

        const { data, error } = await supabase.from("wiki").select("*");

        if (error) {
          throw error;
        }

        if (data) {
          // 将 Supabase 数据转换为 ConceptCard 结构
          const formattedCards: ConceptCard[] = data.map((item: WikiItem) => ({
            id: item.id,
            title: item["词条名称"],
            frontContent: item["内容"],
            backContent: item["内容"],
            author:
              item["人工智能模型"] ||
              (item["人工智能生成 AI-generated"] ? "AI生成" : "人工编辑"),
            source: item["来源Soucre / 章节 Chapter"],
            type: item["定义/解释/翻译校对"],
            aiGenerated: item["人工智能生成 AI-generated"],
          }));

          setCards(formattedCards);
          setFilteredCards(formattedCards);

          // 提取所有概念和作者用于搜索建议
          const allConcepts = [
            ...new Set(data.map((item) => item["词条名称"])),
          ];
          setConcepts(allConcepts);

          const allAuthors = [
            ...new Set(
              data
                .map((item) =>
                  item["人工智能模型"]
                    ? item["人工智能模型"]
                    : item["人工智能生成 AI-generated"]
                    ? "AI生成"
                    : "人工编辑"
                )
                .filter(Boolean)
            ),
          ];
          setAuthors(allAuthors as string[]);
        }
      } catch (error) {
        console.error("获取数据错误:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWikiData();
  }, []);

  const content = (
    <div className="min-h-screen bg-[#FCFADE] px-24 py-12">
      <div className="flex flex-col items-center">
        <h1 className="text-6xl font-bold mb-8 mt-12">AmbiNet Database</h1>
        <p className="text-3xl mb-12 w-2/3 text-center text-black/60">
          Based on the data generated through daily operations, we explore how
          to create a sustainable collaborative platform and assistive tools for
          contemporary humanities researchers, writers, and enthusiasts—a GitHub
          for humanities scholars.
        </p>

        {/* Command 搜索框带提交按钮 */}
        <div className="flex w-[600px] relative">
          <div className="flex-1 border border-black rounded-l-md overflow-visible bg-[#FCFADE]">
            <Command
              className="bg-[#FCFADE]"
              shouldFilter={true}
              ref={commandRef}
            >
              <CommandInput
                placeholder="搜索概念、作者或关键词..."
                className="h-[40px] bg-[#FCFADE] text-black"
                value={searchQuery}
                onValueChange={setSearchQuery}
                onFocus={() => setCommandOpen(true)}
              />
              {commandOpen && (
                <CommandList className="bg-[#FCFADE] absolute left-0 right-0 top-[40px] z-50 max-h-[300px] overflow-y-auto border border-black shadow-lg">
                  <CommandEmpty>未找到相关结果</CommandEmpty>
                  <CommandGroup heading="常见概念">
                    {concepts.slice(0, 5).map((concept) => (
                      <CommandItem
                        key={concept}
                        className="cursor-pointer hover:bg-black/10 p-2"
                        onSelect={() => handleCommandItemClick(concept)}
                      >
                        {concept}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {authors.length > 0 && (
                    <>
                      <CommandSeparator />
                      <CommandGroup heading="热门作者">
                        {authors.slice(0, 3).map((author) => (
                          <CommandItem
                            key={author}
                            className="cursor-pointer hover:bg-black/10 p-2"
                            onSelect={() => handleCommandItemClick(author)}
                          >
                            {author}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              )}
            </Command>
          </div>
          <Button
            className="h-[40px] bg-black text-white font-black text-sm rounded-l-none rounded-r-md hover:bg-black/60"
            onClick={() => {
              handleSearch();
              // 如果有搜索词，导航到词条页面
              if (searchQuery.trim()) {
                handleNavigate(searchQuery);
              }
            }}
          >
            搜索
          </Button>
        </div>
      </div>

      {/* 结果区域 - Carousel */}
      <div className="mt-24 mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">精选概念</h2>
        {filteredCards.length > 0 ? (
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent className="-ml-4">
              {filteredCards.map((card) => (
                <CarouselItem key={card.id} className="pl-4 md:basis-1/3">
                  <FlipCard card={card} onViewDetails={handleNavigate} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-8">
              <CarouselPrevious className="mr-4 relative position-static" />
              <CarouselNext className="relative position-static" />
            </div>
          </Carousel>
        ) : (
          <div className="text-center text-xl">
            没有找到匹配的概念，请尝试其他关键词
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCFADE] flex justify-center items-center">
        <p className="text-2xl">Loading...</p>
      </div>
    );
  }

  // 只在客户端渲染时添加路由逻辑
  return isClient ? content : content;
}
