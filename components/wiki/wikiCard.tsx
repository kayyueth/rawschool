"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Wiki项目类型定义
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

// 调整为前端使用的数据结构
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

// 相关词条卡片组件
const RelatedCard = ({ card }: { card: WikiCard }) => {
  return (
    <Link href={`/wiki/${encodeURIComponent(card.title)}`}>
      <div className="h-[250px] w-full cursor-pointer bg-[#FCFADE] rounded-lg shadow-xl p-6 flex flex-col border border-black hover:bg-[#f5f3cb] transition-colors">
        <h3 className="text-xl font-bold border-b-2 border-black pb-2">
          {card.title}
        </h3>
        <p className="text-md mt-4 flex-grow line-clamp-4">{card.content}</p>
        <div className="mt-4 text-sm text-black/60">
          <p>点击查看详情</p>
        </div>
      </div>
    </Link>
  );
};

export default function WikiCard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [wikiTitle, setWikiTitle] = useState<string | undefined>(undefined);
  const [wikiData, setWikiData] = useState<WikiCard | null>(null);
  const [relatedItems, setRelatedItems] = useState<WikiCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 客户端挂载检测
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);

    // 从 URL 路径中获取标题
    const pathArray = window.location.pathname.split("/");
    if (pathArray.length > 2) {
      const title = decodeURIComponent(pathArray[2]);
      setWikiTitle(title);
    }
  }, []);

  // 获取单个词条详情
  useEffect(() => {
    if (!wikiTitle) return;

    async function fetchWikiItem() {
      try {
        setIsLoading(true);

        // 查询主词条数据
        const { data, error } = await supabase
          .from("wiki")
          .select("*")
          .eq("词条名称", wikiTitle)
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

          // 查找相关词条 - 可以根据多种关联性查找，这里仅示例
          // 1. 相同来源的词条
          const { data: relatedBySource, error: relatedSourceError } =
            await supabase
              .from("wiki")
              .select("*")
              .eq(
                "来源Soucre / 章节 Chapter",
                data["来源Soucre / 章节 Chapter"]
              )
              .neq("id", data.id)
              .limit(5);

          // 2. 相同属性的词条
          const { data: relatedByProperty, error: relatedPropertyError } =
            await supabase
              .from("wiki")
              .select("*")
              .eq("Property", data.Property)
              .neq("id", data.id)
              .limit(5);

          if (relatedSourceError) {
            console.error("获取相关来源词条错误:", relatedSourceError);
          }

          if (relatedPropertyError) {
            console.error("获取相关属性词条错误:", relatedPropertyError);
          }

          // 合并相关词条，并去重
          const combinedRelated = [
            ...(relatedBySource || []),
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
        }
      } catch (error) {
        console.error("获取数据时出错:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWikiItem();
  }, [wikiTitle]);

  // 处理返回到列表页面
  const handleBackToList = () => {
    router.push("/wiki");
  };

  const content = (
    <div className="min-h-screen bg-[#FCFADE] px-24 py-12">
      {isLoading ? (
        <div className="flex justify-center items-center h-[70vh]">
          <p className="text-2xl">加载中...</p>
        </div>
      ) : !wikiData ? (
        <div className="flex flex-col justify-center items-center h-[70vh]">
          <p className="text-2xl">未找到该词条</p>
          <Button
            className="mt-6 bg-black text-white hover:bg-black/70"
            onClick={handleBackToList}
          >
            返回词条列表
          </Button>
        </div>
      ) : (
        <>
          {/* 返回按钮 */}
          <Button
            className="mb-8 bg-black text-white hover:bg-black/70"
            onClick={handleBackToList}
          >
            ← 返回词条列表
          </Button>

          {/* 词条详情 */}
          <div className="bg-white rounded-lg shadow-xl p-12 mb-16 border border-black">
            <h1 className="text-5xl font-bold mb-6">{wikiData.title}</h1>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="col-span-2 md:col-span-1">
                <p className="text-black/60 mb-1">定义/解释/翻译校对</p>
                <p className="text-xl">{wikiData.definition}</p>
              </div>

              <div className="col-span-2 md:col-span-1">
                <p className="text-black/60 mb-1">来源/章节</p>
                <p className="text-xl">{wikiData.source}</p>
              </div>

              <div className="col-span-2 md:col-span-1">
                <p className="text-black/60 mb-1">属性</p>
                <p className="text-xl">{wikiData.property}</p>
              </div>

              <div className="col-span-2 md:col-span-1">
                <p className="text-black/60 mb-1">创建方式</p>
                <p className="text-xl">
                  {wikiData.aiGenerated ? "AI生成" : "人工编辑"}
                </p>
                {wikiData.aiGenerated && wikiData.aiModel && (
                  <p className="text-md text-black/70">
                    使用模型: {wikiData.aiModel}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-12 border-t border-black pt-8">
              <p className="text-black/60 mb-4">内容</p>
              <div className="text-xl whitespace-pre-wrap">
                {wikiData.content}
              </div>
            </div>

            <div className="text-black/50 text-sm">
              <p>创建日期: {wikiData.createdDate}</p>
              <p>最后编辑: {wikiData.lastEditedTime}</p>
            </div>
          </div>

          {/* 相关词条部分 */}
          {relatedItems.length > 0 && (
            <div className="mt-16 mb-20">
              <h2 className="text-3xl font-bold mb-8">相关词条</h2>
              <Carousel className="w-full">
                <CarouselContent className="-ml-4">
                  {relatedItems.map((item) => (
                    <CarouselItem
                      key={item.id}
                      className="pl-4 md:basis-1/3 lg:basis-1/4"
                    >
                      <RelatedCard card={item} />
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

  return isClient ? content : content;
}
