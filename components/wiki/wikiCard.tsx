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
import { Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useWeb3 } from "@/lib/web3Context";
import { getUsernameByWalletAddress } from "@/lib/auth/userService";
import { truncateAddress } from "@/lib/utils";
import { deleteAmbientCard } from "@/lib/services/userContent";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { WikiEditorContent } from "./wikiEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WikiCard {
  id: string;
  title: string;
  content: string;
  definition: string;
  source: string;
  author: string;
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
  const { account } = useWeb3();
  const [wikiData, setWikiData] = useState<WikiCard | null>(null);
  const [relatedItems, setRelatedItems] = useState<WikiCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authorUsername, setAuthorUsername] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

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
          console.error("Error fetching wiki item:", error);
          return;
        }

        if (data) {
          const formattedItem: WikiCard = {
            id: data.id,
            title: data["词条名称"],
            content: data["内容"],
            definition: data["定义/解释/翻译校对"],
            source: data["来源Soucre / 章节 Chapter"],
            author: data["Author"],
            aiGenerated: data["人工智能生成 AI-generated"],
            createdDate: data.Date,
            lastEditedTime: data["Last edited time"],
            aiModel: data["人工智能模型"],
          };

          setWikiData(formattedItem);

          // 获取作者的用户名
          if (data["Author"]) {
            fetchAuthorUsername(data["Author"]);
          }

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
                  "Error fetching related items by source:",
                  relatedSourceError.message ||
                    JSON.stringify(relatedSourceError) ||
                    "Unknown error"
                );
              } else {
                relatedBySource = sourceData || [];
              }
            } catch (error) {
              console.error("Error fetching related items by source:", error);
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
                    "Error fetching related items by author:",
                    relatedAuthorError.message ||
                      JSON.stringify(relatedAuthorError) ||
                      "Unknown error"
                  );
                } else {
                  relatedByAuthor = authorData || [];
                }
              } catch (error) {
                console.error("Error fetching related items by author:", error);
              }
            }

            let relatedByAuthor2 = [];
            try {
              const { data: authorData2, error: relatedAuthorError2 } =
                await supabase
                  .from("wiki")
                  .select("*")
                  .eq("Author", data["Author"])
                  .neq("id", data.id)
                  .limit(5);

              if (relatedAuthorError2) {
                console.error(
                  "Error fetching related items by author:",
                  relatedAuthorError2.message ||
                    JSON.stringify(relatedAuthorError2) ||
                    "Unknown error"
                );
              } else {
                relatedByAuthor2 = authorData2 || [];
              }
            } catch (error) {
              console.error("Error fetching related items by author:", error);
            }

            const combinedRelated = [
              ...(relatedBySource || []),
              ...(relatedByAuthor || []),
              ...(relatedByAuthor2 || []),
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
                  author: item["Author"],
                  aiGenerated: item["人工智能生成 AI-generated"],
                  createdDate: item.Date,
                  lastEditedTime: item["Last edited time"],
                  aiModel: item["人工智能模型"],
                })
              );

              setRelatedItems(formattedRelated);
            }
          } catch (error) {
            console.error("Error fetching related items:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWikiItem();
  }, [title]);

  const fetchAuthorUsername = async (walletAddress: string) => {
    try {
      const username = await getUsernameByWalletAddress(walletAddress);
      setAuthorUsername(username);
    } catch (error) {
      console.error("Error fetching author username:", error);
    }
  };

  const getAuthorDisplayName = () => {
    if (authorUsername) {
      return authorUsername;
    }
    return truncateAddress(wikiData?.author || "");
  };

  const formattedDate = wikiData?.createdDate
    ? formatDistanceToNow(new Date(wikiData.createdDate), {
        addSuffix: true,
        locale: zhCN,
      })
    : "";

  const isAuthor =
    account &&
    wikiData?.author &&
    account.toLowerCase() === wikiData.author.toLowerCase();

  const handleDeleteEntry = async () => {
    if (!wikiData || !account) return;

    try {
      setIsDeleting(true);
      await deleteAmbientCard(wikiData.id, account);
      toast.success("Entry deleted successfully");
      onBackToList();
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete entry"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEditComplete = () => {
    setShowEditDialog(false);
    if (wikiData) {
      setIsLoading(true);
      fetchWikiItem(wikiData.title);
    }
    toast.success("Entry updated successfully");
  };

  const convertToWikiItem = () => {
    if (!wikiData) return null;

    return {
      id: wikiData.id,
      词条名称: wikiData.title,
      "定义/解释/翻译校对": wikiData.definition,
      "来源Soucre / 章节 Chapter": wikiData.source,
      "人工智能生成 AI-generated": wikiData.aiGenerated,
      Date: wikiData.createdDate,
      "Last edited time": wikiData.lastEditedTime,
      人工智能模型: wikiData.aiModel,
      内容: wikiData.content,
      Author: wikiData.author,
      wallet_address: wikiData.author,
    };
  };

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
          {/* 返回按钮和操作按钮 */}
          <div className="flex justify-between items-center mb-8">
            <Button
              className="bg-black text-white hover:bg-black/70"
              onClick={onBackToList}
            >
              ← Back to the list
            </Button>

            {isAuthor && (
              <div className="flex gap-2">
                {/* 编辑按钮 */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 bg-blue-50"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit className="h-5 w-5" />
                </Button>

                {/* 删除按钮和确认对话框 */}
                <AlertDialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-10 w-10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this entry? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteEntry}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          {/* 编辑对话框 */}
          {showEditDialog && wikiData && (
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit entry</DialogTitle>
                </DialogHeader>
                <WikiEditorContent
                  wikiItem={convertToWikiItem()!}
                  onSave={handleEditComplete}
                />
              </DialogContent>
            </Dialog>
          )}

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
                <p className="text-black/60 mb-1">Author</p>
                <p className="text-xl">{getAuthorDisplayName()}</p>
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
              <p>Creation date: {formattedDate}</p>
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
        console.error("Error fetching wiki item:", error);
        return;
      }

      if (data) {
        const formattedItem: WikiCard = {
          id: data.id,
          title: data["词条名称"],
          content: data["内容"],
          definition: data["定义/解释/翻译校对"],
          source: data["来源Soucre / 章节 Chapter"],
          author: data["Author"],
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
                "Error fetching related items by source:",
                relatedSourceError.message ||
                  JSON.stringify(relatedSourceError) ||
                  "Unknown error"
              );
            } else {
              relatedBySource = sourceData || [];
            }
          } catch (error) {
            console.error("Error fetching related items by source:", error);
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
                  "Error fetching related items by author:",
                  relatedAuthorError.message ||
                    JSON.stringify(relatedAuthorError) ||
                    "Unknown error"
                );
              } else {
                relatedByAuthor = authorData || [];
              }
            } catch (error) {
              console.error("Error fetching related items by author:", error);
            }
          }

          let relatedByAuthor2 = [];
          try {
            const { data: authorData2, error: relatedAuthorError2 } =
              await supabase
                .from("wiki")
                .select("*")
                .eq("Author", data["Author"])
                .neq("id", data.id)
                .limit(5);

            if (relatedAuthorError2) {
              console.error(
                "Error fetching related items by author:",
                relatedAuthorError2.message ||
                  JSON.stringify(relatedAuthorError2) ||
                  "Unknown error"
              );
            } else {
              relatedByAuthor2 = authorData2 || [];
            }
          } catch (error) {
            console.error("Error fetching related items by author:", error);
          }

          const combinedRelated = [
            ...(relatedBySource || []),
            ...(relatedByAuthor || []),
            ...(relatedByAuthor2 || []),
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
                author: item["Author"],
                aiGenerated: item["人工智能生成 AI-generated"],
                createdDate: item.Date,
                lastEditedTime: item["Last edited time"],
                aiModel: item["人工智能模型"],
              })
            );

            setRelatedItems(formattedRelated);
          }
        } catch (error) {
          console.error("Error fetching related items:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }
  return isClient ? content : null;
}
