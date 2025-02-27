"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

interface WikiCard {
  id: string;
  title: string;
  content: string;
  definition: string;
  source: string;
  property: string;
  aiGenerated: boolean;
  createdDate: string;
  lastEditedTime: string;
  aiModel: string | null;
}

interface WikiCardProps {
  title: string;
  onBackToList: () => void;
}

const RelatedCard = ({
  card,
  onSelectCard,
}: {
  card: WikiCard;
  onSelectCard: (title: string) => void;
}) => {
  return (
    <div
      className="h-[250px] w-full cursor-pointer bg-[#FCFADE] rounded-lg shadow-xl p-6 flex flex-col border border-black hover:bg-black/10 transition-colors"
      onClick={() => onSelectCard(card.title)}
    >
      <h3 className="text-xl font-bold border-b-2 border-black pb-2">
        {card.title}
      </h3>
      <p className="text-md mt-4 flex-grow line-clamp-4">{card.content}</p>
      <div className="mt-4 text-sm text-black/60">
        <p>Click to view details</p>
      </div>
    </div>
  );
};

export default function WikiCardComponent({
  title,
  onBackToList,
}: WikiCardProps) {
  const [wikiData, setWikiData] = useState<WikiCard | null>(null);
  const [relatedItems, setRelatedItems] = useState<WikiCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!title) return;

    async function fetchWikiItem() {
      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from("wiki")
          .select("*")
          .eq("词条名称", title)
          .single();

        if (error) {
          console.error("获取词条数据错误:", error);
          return;
        }

        if (data) {
          const formattedItem: WikiCard = {
            id: data.id,
            title: data["词条名称"],
            content: data["内容"],
            definition: data["定义/解释/翻译校对"],
            source: data["来源Soucre / 章节 Chapter"],
            property: data.Property,
            aiGenerated: data["人工智能生成 AI-generated"],
            createdDate: data.Date,
            lastEditedTime: data["Last edited time"],
            aiModel: data["人工智能模型"],
          };

          setWikiData(formattedItem);

          const sourceInfo = data["来源Soucre / 章节 Chapter"] || "";
          let bookName = sourceInfo;
          let authorName = "";

          const authorMatch = sourceInfo.match(/^([^：:]+)[：:]/);
          if (authorMatch) {
            authorName = authorMatch[1].trim();
            bookName = sourceInfo.substring(authorMatch[0].length).trim();
          }

          try {
            let relatedBySource = [];
            try {
              const { data: sourceData, error: relatedSourceError } =
                await supabase
                  .from("wiki")
                  .select("*")
                  .filter(
                    '"来源Soucre / 章节 Chapter"',
                    "eq",
                    data["来源Soucre / 章节 Chapter"]
                  )
                  .neq("id", data.id)
                  .limit(5);

              if (relatedSourceError) {
                console.error(
                  "获取相同来源词条错误:",
                  relatedSourceError.message ||
                    JSON.stringify(relatedSourceError) ||
                    "未知错误"
                );
              } else {
                relatedBySource = sourceData || [];
              }
            } catch (error) {
              console.error("尝试获取相同来源词条时出错:", error);
            }

            let relatedByAuthor = [];
            if (authorName) {
              try {
                const { data: authorData, error: relatedAuthorError } =
                  await supabase
                    .from("wiki")
                    .select("*")
                    .or(
                      `内容.ilike.%${authorName}%,词条名称.ilike.%${authorName}%`
                    )
                    .neq("id", data.id)
                    .limit(5);

                if (relatedAuthorError) {
                  console.error(
                    "获取相同作者词条错误:",
                    relatedAuthorError.message ||
                      JSON.stringify(relatedAuthorError) ||
                      "未知错误"
                  );
                } else {
                  relatedByAuthor = authorData || [];
                }
              } catch (error) {
                console.error("尝试获取相同作者词条时出错:", error);
              }
            }

            let relatedByProperty = [];
            try {
              const { data: propertyData, error: relatedPropertyError } =
                await supabase
                  .from("wiki")
                  .select("*")
                  .eq("Property", data.Property)
                  .neq("id", data.id)
                  .limit(5);

              if (relatedPropertyError) {
                console.error(
                  "获取相关属性词条错误:",
                  relatedPropertyError.message ||
                    JSON.stringify(relatedPropertyError) ||
                    "未知错误"
                );
              } else {
                relatedByProperty = propertyData || [];
              }
            } catch (error) {
              console.error("尝试获取相同属性词条时出错:", error);
            }

            const combinedRelated = [
              ...(relatedBySource || []),
              ...(relatedByAuthor || []),
              ...(relatedByProperty || []),
            ];
            const uniqueRelated = Array.from(
              new Set(combinedRelated.map((item) => item.id))
            )
              .map((id) => combinedRelated.find((item) => item.id === id))
              .filter(Boolean)
              .slice(0, 10);

            if (uniqueRelated.length > 0) {
              const formattedRelated: WikiCard[] = uniqueRelated.map(
                (item: any) => ({
                  id: item.id,
                  title: item["词条名称"],
                  content: item["内容"],
                  definition: item["定义/解释/翻译校对"],
                  source: item["来源Soucre / 章节 Chapter"],
                  property: item.Property,
                  aiGenerated: item["人工智能生成 AI-generated"],
                  createdDate: item.Date,
                  lastEditedTime: item["Last edited time"],
                  aiModel: item["人工智能模型"],
                })
              );

              setRelatedItems(formattedRelated);
            }
          } catch (error) {
            console.error("获取相关词条错误:", error);
          }
        }
      } catch (error) {
        console.error("获取数据时出错:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWikiItem();
  }, [title]);

  const content = (
    <div className="min-h-screen bg-[#FCFADE] px-24 py-12">
      {isLoading ? (
        <div className="flex justify-center items-center h-[70vh]">
          <p className="text-2xl">Loading...</p>
        </div>
      ) : !wikiData ? (
        <div className="flex flex-col justify-center items-center h-[70vh]">
          <p className="text-2xl">No such item found</p>
          <Button
            className="mt-6 bg-black text-white hover:bg-black/70"
            onClick={onBackToList}
          >
            Back to the list
          </Button>
        </div>
      ) : (
        <>
          {/* 返回按钮 */}
          <Button
            className="mb-8 bg-black text-white hover:bg-black/70"
            onClick={onBackToList}
          >
            ← Back to the list
          </Button>

          {/* 词条详情 */}
          <div className="bg-[#FCFADE] rounded-lg shadow-xl p-12 mb-16 border border-black">
            <h1 className="text-5xl font-bold mb-6">{wikiData.title}</h1>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="col-span-2 md:col-span-1">
                <p className="text-black/60 mb-1">
                  Definition/Explanation/Translation
                </p>
                <p className="text-xl">{wikiData.definition}</p>
              </div>

              <div className="col-span-2 md:col-span-1">
                <p className="text-black/60 mb-1">Source/Chapter</p>
                <p className="text-xl">{wikiData.source}</p>
              </div>

              <div className="col-span-2 md:col-span-1">
                <p className="text-black/60 mb-1">Property</p>
                <p className="text-xl">{wikiData.property}</p>
              </div>

              <div className="col-span-2 md:col-span-1">
                <p className="text-black/60 mb-1">Creation Method</p>
                <p className="text-xl">
                  {wikiData.aiGenerated ? "AI generated" : "Manual editing"}
                </p>
                {wikiData.aiGenerated && wikiData.aiModel && (
                  <p className="text-md text-black/70">
                    Model used: {wikiData.aiModel}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-12 border-t border-black pt-8">
              <p className="text-black/60 mb-4">Content</p>
              <div className="text-xl whitespace-pre-wrap">
                {wikiData.content}
              </div>
            </div>

            <div className="text-black/50 text-sm">
              <p>Creation date: {wikiData.createdDate}</p>
              <p>Last edited: {wikiData.lastEditedTime}</p>
            </div>
          </div>

          {/* 相关词条部分 */}
          {relatedItems.length > 0 && (
            <div className="mt-16 mb-20">
              <h2 className="text-3xl font-bold mb-8">Related items</h2>
              <Carousel className="w-full">
                <CarouselContent className="-ml-4">
                  {relatedItems.map((item) => (
                    <CarouselItem
                      key={item.id}
                      className="pl-4 md:basis-1/3 lg:basis-1/4"
                    >
                      <RelatedCard
                        card={item}
                        onSelectCard={(title) => {
                          window.scrollTo(0, 0);
                          location.hash = `#${encodeURIComponent(title)}`;
                          location.hash = "";
                          setWikiData(null);
                          setIsLoading(true);
                          setTimeout(() => {
                            fetchWikiItem(title);
                          }, 100);
                        }}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center mt-8">
                  <CarouselPrevious className="mr-4 relative position-static" />
                  <CarouselNext className="relative position-static" />
                </div>
              </Carousel>
            </div>
          )}
        </>
      )}
    </div>
  );

  async function fetchWikiItem(itemTitle: string) {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("wiki")
        .select("*")
        .eq("词条名称", itemTitle)
        .single();

      if (error) {
        console.error("获取词条数据错误:", error);
        return;
      }

      if (data) {
        const formattedItem: WikiCard = {
          id: data.id,
          title: data["词条名称"],
          content: data["内容"],
          definition: data["定义/解释/翻译校对"],
          source: data["来源Soucre / 章节 Chapter"],
          property: data.Property,
          aiGenerated: data["人工智能生成 AI-generated"],
          createdDate: data.Date,
          lastEditedTime: data["Last edited time"],
          aiModel: data["人工智能模型"],
        };

        setWikiData(formattedItem);

        const sourceInfo = data["来源Soucre / 章节 Chapter"] || "";
        let bookName = sourceInfo;
        let authorName = "";

        const authorMatch = sourceInfo.match(/^([^：:]+)[：:]/);
        if (authorMatch) {
          authorName = authorMatch[1].trim();
          bookName = sourceInfo.substring(authorMatch[0].length).trim();
        }

        try {
          let relatedBySource = [];
          try {
            const { data: sourceData, error: relatedSourceError } =
              await supabase
                .from("wiki")
                .select("*")
                .filter(
                  '"来源Soucre / 章节 Chapter"',
                  "eq",
                  data["来源Soucre / 章节 Chapter"]
                )
                .neq("id", data.id)
                .limit(5);

            if (relatedSourceError) {
              console.error(
                "获取相同来源词条错误:",
                relatedSourceError.message ||
                  JSON.stringify(relatedSourceError) ||
                  "未知错误"
              );
            } else {
              relatedBySource = sourceData || [];
            }
          } catch (error) {
            console.error("尝试获取相同来源词条时出错:", error);
          }

          let relatedByAuthor = [];
          if (authorName) {
            try {
              const { data: authorData, error: relatedAuthorError } =
                await supabase
                  .from("wiki")
                  .select("*")
                  .or(
                    `内容.ilike.%${authorName}%,词条名称.ilike.%${authorName}%`
                  )
                  .neq("id", data.id)
                  .limit(5);

              if (relatedAuthorError) {
                console.error(
                  "获取相同作者词条错误:",
                  relatedAuthorError.message ||
                    JSON.stringify(relatedAuthorError) ||
                    "未知错误"
                );
              } else {
                relatedByAuthor = authorData || [];
              }
            } catch (error) {
              console.error("尝试获取相同作者词条时出错:", error);
            }
          }

          let relatedByProperty = [];
          try {
            const { data: propertyData, error: relatedPropertyError } =
              await supabase
                .from("wiki")
                .select("*")
                .eq("Property", data.Property)
                .neq("id", data.id)
                .limit(5);

            if (relatedPropertyError) {
              console.error(
                "获取相关属性词条错误:",
                relatedPropertyError.message ||
                  JSON.stringify(relatedPropertyError) ||
                  "未知错误"
              );
            } else {
              relatedByProperty = propertyData || [];
            }
          } catch (error) {
            console.error("尝试获取相同属性词条时出错:", error);
          }

          const combinedRelated = [
            ...(relatedBySource || []),
            ...(relatedByAuthor || []),
            ...(relatedByProperty || []),
          ];
          const uniqueRelated = Array.from(
            new Set(combinedRelated.map((item) => item.id))
          )
            .map((id) => combinedRelated.find((item) => item.id === id))
            .filter(Boolean)
            .slice(0, 10);

          if (uniqueRelated.length > 0) {
            const formattedRelated: WikiCard[] = uniqueRelated.map(
              (item: any) => ({
                id: item.id,
                title: item["词条名称"],
                content: item["内容"],
                definition: item["定义/解释/翻译校对"],
                source: item["来源Soucre / 章节 Chapter"],
                property: item.Property,
                aiGenerated: item["人工智能生成 AI-generated"],
                createdDate: item.Date,
                lastEditedTime: item["Last edited time"],
                aiModel: item["人工智能模型"],
              })
            );

            setRelatedItems(formattedRelated);
          }
        } catch (error) {
          console.error("获取相关词条错误:", error);
        }
      }
    } catch (error) {
      console.error("获取数据时出错:", error);
    } finally {
      setIsLoading(false);
    }
  }
  return isClient ? content : content;
}
