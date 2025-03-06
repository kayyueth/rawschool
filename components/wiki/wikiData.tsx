"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { CreateWikiButton } from "./wikiEditor";
import { useWeb3 } from "@/lib/web3Context";

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
  Author: string;
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
        className="md:h-[400px] h-[280px] w-full perspective-1000 cursor-pointer"
        onClick={handleCardClick}
      >
        <div
          className={`relative w-full md:h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* card front */}
          <div className="absolute w-full md:h-full backface-hidden bg-[#FCFADE] rounded-lg shadow-xl p-6 flex flex-col border border-black">
            <h3 className="md:text-2xl text-xl font-bold border-b-2 border-black pb-2">
              {card.title}
            </h3>
            <p className="md:text-lg text-sm mt-4 flex-grow">
              {card.frontContent}
            </p>
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
          <div className="absolute w-full md:h-full backface-hidden bg-black text-white rounded-lg shadow-xl p-6 rotate-y-180 flex flex-col">
            <h3 className="md:text-2xl text-xl font-bold border-b-2 border-white pb-2">
              {card.title}
            </h3>
            <p className="md:text-lg text-sm mt-4 flex-grow">
              {card.backContent}
            </p>
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
  const [searchFeedback, setSearchFeedback] = useState<string>("");

  const [isClient, setIsClient] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useWeb3();

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

  const scrollToResults = () => {
    const resultsSection = document.getElementById("results-section");
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredCards(cards);
      setSearchFeedback("");
      return;
    }

    const filtered = cards.filter(
      (card) =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.frontContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.source.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredCards(filtered);

    if (filtered.length === 0) {
      setSearchFeedback(`未找到匹配"${searchQuery}"的结果`);
    } else {
      setSearchFeedback(`找到 ${filtered.length} 个匹配"${searchQuery}"的结果`);
    }

    setTimeout(scrollToResults, 100);

    return filtered.length > 0;
  };

  const isAuthorSearchQuery = (query: string): boolean => {
    const exactAuthorMatch = authors.some(
      (author) => author.toLowerCase() === query.toLowerCase()
    );

    if (exactAuthorMatch) return true;

    const exactConceptMatch = concepts.some(
      (concept) => concept.toLowerCase() === query.toLowerCase()
    );

    if (exactConceptMatch) return false;

    const authorMatches = authors.filter((author) =>
      author.toLowerCase().includes(query.toLowerCase())
    );

    const conceptMatches = concepts.filter((concept) =>
      concept.toLowerCase().includes(query.toLowerCase())
    );

    if (authorMatches.length > 0 && conceptMatches.length === 0) {
      return true;
    }

    return false;
  };

  const handleAuthorSearch = (authorName: string) => {
    const filtered = cards.filter((card) =>
      card.author.toLowerCase().includes(authorName.toLowerCase())
    );
    setFilteredCards(filtered);

    if (filtered.length === 0) {
      setSearchFeedback(`No results found for "${authorName}"`);
    } else {
      setSearchFeedback(`Found ${filtered.length} results for "${authorName}"`);
    }

    setCommandOpen(false);

    setTimeout(scrollToResults, 100);
  };

  const handleCommandItemClick = (value: string, isAuthor: boolean = false) => {
    setSearchQuery(value);
    setCommandOpen(false);

    if (isAuthor) {
      handleAuthorSearch(value);
    } else {
      handleSearch();
      setTimeout(() => {
        handleNavigate(value);
      }, 100);
    }
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
              item["Author"] ||
              (item["人工智能生成 AI-generated"] && item["人工智能模型"]
                ? item["人工智能模型"]
                : item["人工智能生成 AI-generated"]
                ? "AI生成"
                : "人工编辑"),
            source: item["来源Soucre / 章节 Chapter"],
            type: item["定义/解释/翻译校对"],
            aiGenerated: item["人工智能生成 AI-generated"],
          }));

          setCards(formattedCards);
          setFilteredCards(formattedCards);

          const allConcepts = [
            ...new Set(data.map((item) => item["词条名称"])),
          ];
          setConcepts(allConcepts);

          const allAuthors = [
            ...new Set(
              data
                .map(
                  (item) =>
                    item["Author"] ||
                    (item["人工智能生成 AI-generated"] && item["人工智能模型"]
                      ? item["人工智能模型"]
                      : item["人工智能生成 AI-generated"]
                      ? "AI生成"
                      : "人工编辑")
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
    <div className="md:min-h-screen bg-[#FCFADE] md:px-24 py-12">
      <div className="flex flex-col items-center">
        <h1 className="md:text-6xl text-2xl font-bold mb-4 md:mb-8 md:mt-12">
          AmbiNet Database
        </h1>
        <p className="md:text-3xl text-sm mb-6 md:mb-12 md:w-2/3 w-[310px] text-center text-black/60">
          Based on the data generated through daily operations, we explore how
          to create a sustainable collaborative platform and assistive tools for
          contemporary humanities researchers, writers, and enthusiasts—a GitHub
          for humanities scholars.
        </p>

        <div className="flex md:w-[600px] w-[310px] relative">
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
                  } else if (e.key === "Enter") {
                    if (isAuthorSearchQuery(searchQuery)) {
                      handleAuthorSearch(searchQuery);
                    } else {
                      const hasResults = handleSearch();

                      if (searchQuery.trim() && hasResults) {
                        const exactMatch = cards.find(
                          (card) =>
                            card.title.toLowerCase() ===
                            searchQuery.toLowerCase()
                        );

                        if (exactMatch) {
                          handleNavigate(exactMatch.title);
                        } else if (filteredCards.length > 0) {
                          handleNavigate(filteredCards[0].title);
                        }
                      }
                    }

                    setCommandOpen(false);
                  }
                }}
              />
            </div>
            {commandOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-[40px] z-50 max-h-[300px] overflow-y-auto border border-black shadow-lg bg-[#FCFADE]">
                {!concepts.filter((c) =>
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
                              handleCommandItemClick(concept, false);
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
                            .slice(0, 5)
                            .map((author) => (
                              <div
                                key={author}
                                className="cursor-pointer p-2 hover:bg-black/10 rounded-sm text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCommandItemClick(author, true);
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
            className="h-[43px] bg-black text-white font-black text-sm rounded-l-none rounded-r-md hover:bg-black/60"
            onClick={() => {
              if (isAuthorSearchQuery(searchQuery)) {
                handleAuthorSearch(searchQuery);
              } else {
                const hasResults = handleSearch();

                if (searchQuery.trim() && hasResults) {
                  const exactMatch = cards.find(
                    (card) =>
                      card.title.toLowerCase() === searchQuery.toLowerCase()
                  );

                  if (exactMatch) {
                    handleNavigate(exactMatch.title);
                  } else if (filteredCards.length > 0) {
                    handleNavigate(filteredCards[0].title);
                  }
                }
              }
            }}
          >
            Search
          </Button>
        </div>

        {/* Add Card 按钮 - 仅在钱包连接时显示 */}
        {isConnected && (
          <div className="absolute right-20 top-30">
            <CreateWikiButton
              onSave={() => {
                // 保存后刷新数据
                setIsLoading(true);
                // 重新获取数据
                async function refreshData() {
                  try {
                    const { data, error } = await supabase
                      .from("wiki")
                      .select("*")
                      .order("Date", { ascending: false });

                    if (error) throw error;

                    if (data) {
                      // 转换数据格式
                      const formattedCards = data.map((item) => ({
                        id: item.id,
                        title: item.词条名称,
                        frontContent: item["定义/解释/翻译校对"],
                        backContent: item.内容,
                        author: item.Author,
                        source: item["来源Soucre / 章节 Chapter"],
                        type: item.Property || "concept",
                        aiGenerated: item["人工智能生成 AI-generated"],
                      }));

                      setCards(formattedCards);
                      setFilteredCards(formattedCards);
                    }
                  } catch (err) {
                    console.error("Error fetching wiki data:", err);
                  } finally {
                    setIsLoading(false);
                  }
                }

                refreshData();
              }}
            />
          </div>
        )}
      </div>

      <div className="md:mt-16 mb-4 text-center text-lg">
        {searchFeedback && <p>{searchFeedback}</p>}
      </div>

      <div id="results-section" className="mt-8 px-10 md:px-24 md:mb-20">
        <h2 className="md:text-3xl text-2xl font-bold mb-4 md:mb-8 text-center">
          {searchQuery.trim() ? "Search Results" : "Featured Concepts"}
        </h2>
        {filteredCards.length > 0 ? (
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
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
          <div className="text-center md:text-xl text-sm">
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
