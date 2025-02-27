"use client";

import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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

interface WikiDataProps {
  onViewDetail?: (title: string) => void;
}

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
  onViewDetail,
}: {
  card: ConceptCard;
  onViewDetail: (title: string) => void;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    setIsFlipped(!isFlipped);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetail(card.title);
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
                View Details
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
                View Full Content
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function WikiData({ onViewDetail }: WikiDataProps) {
  const [cards, setCards] = useState<ConceptCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<ConceptCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [commandOpen, setCommandOpen] = useState(false);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNavigate = (title: string) => {
    if (onViewDetail) {
      onViewDetail(title);
    } else {
      console.warn("onViewDetail prop is not provided");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (commandOpen && !target.closest(".flex-1")) {
        setCommandOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [commandOpen]);

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

  const handleCommandItemClick = (value: string) => {
    setSearchQuery(value);
    setCommandOpen(false);
    handleSearch();
    setTimeout(() => {
      handleNavigate(value);
    }, 100);
  };

  useEffect(() => {
    async function fetchWikiData() {
      try {
        setIsLoading(true);

        const { data, error } = await supabase.from("wiki").select("*");

        if (error) {
          throw error;
        }

        if (data) {
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

        <div className="flex w-[600px] relative">
          <div className="flex-1 border border-black rounded-l-md overflow-visible bg-[#FCFADE] relative">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                type="text"
                placeholder="Search concepts, authors, or keywords..."
                className="flex h-[40px] w-full bg-[#FCFADE] text-black py-3 text-sm outline-none placeholder:text-black/50"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCommandOpen(true);
                }}
                onFocus={() => setCommandOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setCommandOpen(false);
                  }
                }}
              />
            </div>
            {commandOpen && (
              <div className="absolute left-0 right-0 top-[40px] z-50 max-h-[300px] overflow-y-auto border border-black shadow-lg bg-[#FCFADE]">
                {searchQuery &&
                !concepts.filter((c) =>
                  c.toLowerCase().includes(searchQuery.toLowerCase())
                ).length &&
                !authors.filter((a) =>
                  a.toLowerCase().includes(searchQuery.toLowerCase())
                ).length ? (
                  <div className="py-6 text-center text-sm">
                    No results found
                  </div>
                ) : (
                  <>
                    <div className="p-1">
                      <div className="px-2 py-1.5 text-xs font-medium text-black/50">
                        Trendy Concepts
                      </div>
                      {concepts
                        .filter(
                          (concept) =>
                            !searchQuery ||
                            concept
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((concept) => (
                          <div
                            key={concept}
                            className="cursor-pointer p-2 hover:bg-black/10 rounded-sm text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCommandItemClick(concept);
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {concept}
                          </div>
                        ))}
                    </div>
                    {authors.length > 0 && (
                      <>
                        <div className="h-px bg-black/20 -mx-1"></div>
                        <div className="p-1">
                          <div className="px-2 py-1.5 text-xs font-medium text-black/50">
                            Popular Authors
                          </div>
                          {authors
                            .filter(
                              (author) =>
                                !searchQuery ||
                                author
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase())
                            )
                            .slice(0, 3)
                            .map((author) => (
                              <div
                                key={author}
                                className="cursor-pointer p-2 hover:bg-black/10 rounded-sm text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCommandItemClick(author);
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                {author}
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <Button
            className="h-[42px] bg-black text-white font-black text-sm rounded-l-none rounded-r-md hover:bg-black/60"
            onClick={() => {
              handleSearch();
              if (searchQuery.trim()) {
                handleNavigate(searchQuery);
              }
            }}
          >
            Search
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="mt-24 mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Featured Concepts
        </h2>
        {filteredCards.length > 0 ? (
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent className="-ml-4">
              {filteredCards.map((card) => (
                <CarouselItem key={card.id} className="pl-4 md:basis-1/3">
                  <FlipCard card={card} onViewDetail={handleNavigate} />
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
            No matching concepts found, please try other keywords
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
  return isClient ? content : content;
}
