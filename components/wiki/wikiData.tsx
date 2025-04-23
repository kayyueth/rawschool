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
import FlipCard from "./FlipCard";
import { Loading } from "@/components/ui/loading";

interface WikiItem {
  id: string;
  "Wiki Name": string;
  "Content Type": string;
  Chapter: string;
  Editor: string;
  "AI-generated": boolean;
  Date: string;
  "Last edited time": string;
  "AI model": string | null;
  Content: string;
  Page: string | null;
  "Book Title / DOI / Website": string | null;
  Username: string | null;
}

// Local interface for the cards within this component
interface ConceptCard {
  id: string;
  title: string;
  frontContent: string; // Additional field for the front of the card
  backContent: string;
  editor: string;
  source: string;
  type: string;
  aiGenerated: boolean;
  date?: string; // Optional date field
  bookTitle?: string | null; // Optional book title
  page?: string | null; // Optional page field
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
        card.editor.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

    return authorMatches.length > conceptMatches.length;
  };

  const handleAuthorSearch = (authorName: string) => {
    const filtered = cards.filter((card) =>
      card.editor.toLowerCase().includes(authorName.toLowerCase())
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
            title: item["Wiki Name"],
            frontContent: item["Content"],
            backContent: item["Content"],
            editor: item["Editor"] || "人工编辑",
            source: item["Chapter"],
            type: item["Content Type"],
            aiGenerated: item["AI-generated"],
            date: item["Date"]
              ? item["Date"].toString()
              : new Date().toISOString(),
            bookTitle: item["Book Title / DOI / Website"],
            page: item["Page"],
          }));

          setCards(formattedCards);
          setFilteredCards(formattedCards);

          const allConcepts = [
            ...new Set(data.map((item) => item["Wiki Name"])),
          ];
          setConcepts(allConcepts);

          const allAuthors = [
            ...new Set(
              data.map((item) => item["Editor"] || "人工编辑").filter(Boolean)
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

  // Update the adapter function
  const adaptCardForFlipCard = (card: ConceptCard) => {
    return {
      id: card.id,
      title: card.title,
      frontContent: card.frontContent,
      backContent: card.backContent,
      editor: card.editor,
      chapter: card.source, // Map source to chapter
      type: card.type,
      aiGenerated: card.aiGenerated,
      date: card.date || new Date().toISOString(), // Use provided date or default to today
      bookTitle: card.bookTitle,
      page: card.page,
    };
  };

  const content = (
    <div className="md:min-h-screen bg-[#FCFADE] md:px-24 py-12">
      <div className="absolute right-20 top-20">
        {isConnected && <CreateWikiButton />}
      </div>
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
                placeholder="Search concepts, editors, or keywords..."
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
                    <div className="p-1">
                      <div className="px-2 py-1.5 text-xs font-medium text-black/50">
                        Editors
                      </div>
                      {authors
                        .filter(
                          (editor) =>
                            !searchQuery ||
                            editor
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((editor) => (
                          <div
                            key={editor}
                            className="cursor-pointer p-2 hover:bg-black/10 rounded-sm text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCommandItemClick(editor, true);
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {editor}
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="bg-black hover:bg-black/80 rounded-r-md rounded-l-none h-11 border border-l-0 border-black"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>

        {searchFeedback && (
          <div className="mt-4 text-black/70">{searchFeedback}</div>
        )}
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
                  <FlipCard
                    card={adaptCardForFlipCard(card)}
                    onViewDetail={handleNavigate}
                  />
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
    return <Loading variant="fullPage" />;
  }
  return isClient ? content : content;
}
