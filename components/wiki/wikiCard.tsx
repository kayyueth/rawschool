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
import { WikiCard } from "./types";

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
    fetchWikiItem(title);
  }, [title]);

  useEffect(() => {
    if (wikiData) {
      console.log("wikiData updated:", wikiData);
      console.log("Book title:", wikiData.bookTitle);
      console.log("Content type:", wikiData.contentType);
      console.log("Chapter:", wikiData.chapter);
      console.log("Page:", wikiData.page);
    }
  }, [wikiData]);

  async function fetchWikiItem(itemTitle: string) {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("wiki")
        .select("*")
        .eq("Wiki Name", itemTitle)
        .single();

      if (error) {
        console.error("Error fetching wiki item:", error);
        return;
      }

      if (data) {
        console.log("Raw data from DB:", data);
        console.log(
          "Book Title / DOI / Website value:",
          data["Book Title / DOI / Website"]
        );

        const formattedItem: WikiCard = {
          id: data.id,
          title: data["Wiki Name"],
          content: data["Content"],
          editor: data["Editor"],
          aiGenerated: data["AI-generated"],
          createdDate: data["Date"] || "",
          lastEditedTime: data["Last edited time"] || "",
          aiModel: data["AI model"] || null,
          bookTitle: data["Book Title / DOI / Website"] || null,
          contentType: data["Content Type"],
          chapter: data["Chapter"],
          page: data["Page"] || null,
          username: data["Username"] || null,
        };

        console.log("Formatted wiki data:", formattedItem);

        setWikiData(formattedItem);

        // Fetch editor's username
        if (data["Editor"]) {
          fetchAuthorUsername(data["Editor"]);
        }

        const chapterInfo = data["Chapter"] || "";
        let bookName = data["Book Title / DOI / Website"] || chapterInfo;
        let editorName = data["Editor"] || "";

        try {
          let relatedByBook = [];
          try {
            console.log(
              "Attempting to fetch related items with book title:",
              data["Book Title / DOI / Website"]
            );

            // Try to get column info first
            try {
              const { data: tableInfo, error: tableError } = await supabase
                .from("wiki")
                .select("*")
                .limit(1);

              if (tableInfo && tableInfo.length > 0) {
                console.log(
                  "First row column names:",
                  Object.keys(tableInfo[0])
                );
              }

              if (tableError) {
                console.error("Error fetching table info:", tableError);
              }
            } catch (infoError) {
              console.error("Error fetching column info:", infoError);
            }

            // Use match instead of eq for complex column names
            const { data: bookData, error: relatedBookError } = await supabase
              .from("wiki")
              .select("*")
              .filter(
                '"Book Title / DOI / Website"',
                "eq",
                data["Book Title / DOI / Website"]
              )
              .neq("id", data.id)
              .limit(5);

            console.log("Related book query result:", {
              bookData,
              relatedBookError,
            });

            if (relatedBookError) {
              console.error(
                "Error fetching related items by book:",
                relatedBookError.message ||
                  JSON.stringify(relatedBookError) ||
                  "Unknown error"
              );
            } else {
              relatedByBook = bookData || [];
            }
          } catch (error) {
            console.error("Error fetching related items by book:", error);
          }

          let relatedByChapter = [];
          try {
            const { data: chapterData, error: relatedChapterError } =
              await supabase
                .from("wiki")
                .select("*")
                .eq("Chapter", data["Chapter"])
                .neq("id", data.id)
                .limit(5);

            if (relatedChapterError) {
              console.error(
                "Error fetching related items by chapter:",
                relatedChapterError.message ||
                  JSON.stringify(relatedChapterError) ||
                  "Unknown error"
              );
            } else {
              relatedByChapter = chapterData || [];
            }
          } catch (error) {
            console.error("Error fetching related items by chapter:", error);
          }

          let relatedByEditor = [];
          try {
            const { data: editorData, error: relatedEditorError } =
              await supabase
                .from("wiki")
                .select("*")
                .eq("Editor", data["Editor"])
                .neq("id", data.id)
                .limit(5);

            if (relatedEditorError) {
              console.error(
                "Error fetching related items by editor:",
                relatedEditorError.message ||
                  JSON.stringify(relatedEditorError) ||
                  "Unknown error"
              );
            } else {
              relatedByEditor = editorData || [];
            }
          } catch (error) {
            console.error("Error fetching related items by editor:", error);
          }

          const combinedRelated = [
            ...(relatedByBook || []),
            ...(relatedByChapter || []),
            ...(relatedByEditor || []),
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
                title: item["Wiki Name"],
                content: item["Content"],
                editor: item["Editor"],
                aiGenerated: item["AI-generated"],
                createdDate: item["Date"] || "",
                lastEditedTime: item["Last edited time"] || "",
                aiModel: item["AI model"] || null,
                bookTitle: item["Book Title / DOI / Website"] || null,
                contentType: item["Content Type"],
                chapter: item["Chapter"],
                page: item["Page"] || null,
                username: item["Username"] || null,
              })
            );
            setRelatedItems(formattedRelated);
          }
        } catch (error) {
          console.error("Error processing related items:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching wiki item:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchAuthorUsername = async (walletAddress: string) => {
    try {
      const username = await getUsernameByWalletAddress(walletAddress);
      setAuthorUsername(username);
    } catch (error) {
      console.error("Failed to fetch author username:", error);
    }
  };

  const getAuthorDisplayName = () => {
    if (!wikiData) return "";

    if (authorUsername) {
      return authorUsername;
    }

    if (wikiData.username) {
      return wikiData.username;
    }

    if (wikiData.aiGenerated && wikiData.aiModel) {
      return `AI (${wikiData.aiModel})`;
    }

    return wikiData.editor || (wikiData.aiGenerated ? "AI生成" : "未知编辑");
  };

  const formattedDate = wikiData?.createdDate
    ? formatDistanceToNow(new Date(wikiData.createdDate), {
        addSuffix: true,
        locale: zhCN,
      })
    : "";

  const isAuthor =
    account &&
    wikiData?.editor &&
    account.toLowerCase() === wikiData.editor.toLowerCase();

  const handleDeleteEntry = async () => {
    if (!wikiData?.id) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("wiki")
        .delete()
        .eq("id", wikiData.id);

      if (error) {
        console.error("Error deleting wiki entry:", error);
        toast.error("删除条目失败");
      } else {
        toast.success("条目已成功删除");
        onBackToList();
      }
    } catch (error) {
      console.error("Error deleting wiki entry:", error);
      toast.error("删除条目失败");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEditComplete = () => {
    setShowEditDialog(false);
    fetchWikiItem(title);
    toast.success("条目已成功更新");
  };

  const convertToWikiItem = () => {
    if (!wikiData) return null;
    return {
      id: wikiData.id,
      "Wiki Name": wikiData.title,
      Content: wikiData.content,
      Editor: wikiData.editor,
      "AI-generated": wikiData.aiGenerated,
      Date: wikiData.createdDate,
      "Last edited time": wikiData.lastEditedTime,
      "AI model": wikiData.aiModel,
      "Book Title / DOI / Website": wikiData.bookTitle,
      "Content Type": wikiData.contentType,
      Chapter: wikiData.chapter,
      Page: wikiData.page,
      Username: wikiData.username,
    };
  };

  const content = (
    <div className="md:min-h-screen bg-[#FCFADE] md:px-24 px-8 py-12">
      {isLoading ? (
        <div className="flex justify-center items-center h-[70vh]">
          <p className="md:text-2xl text-xl">Loading...</p>
        </div>
      ) : !wikiData ? (
        <div className="flex flex-col justify-center items-center h-[70vh]">
          <p className="md:text-2xl text-xl">No such item found</p>
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
          <div className="bg-[#FCFADE] rounded-lg shadow-xl md:p-12 p-6 md:mb-16 mb-8 border border-black">
            <h1 className="md:text-5xl text-2xl font-bold md:mb-6 mb-2">
              {wikiData.title}
            </h1>

            <div className="md:grid md:grid-cols-2 gap-8 md:mb-8 mb-4">
              <div className="col-span-2 md:col-span-1">
                <p className="text-black/60 mb-1 md:text-sm text-xs">Editor</p>
                <p className="md:text-xl text-xs">{getAuthorDisplayName()}</p>
              </div>

              <div className="col-span-2 md:col-span-1">
                <p className="text-black/60 mb-1 md:text-sm text-xs">
                  AI Model
                </p>
                <p className="md:text-xl text-xs">
                  {wikiData.aiGenerated ? "AI generated" : ""}
                </p>
                {wikiData.aiGenerated && wikiData.aiModel && (
                  <p className="md:text-md text-xs text-black/70">
                    Model used: {wikiData.aiModel}
                  </p>
                )}
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 gap-8 md:mb-8 mb-4 md:pt-4 pt-2">
              <div className="col-span-2 md:col-span-1 mb-4">
                <p className="text-black/60 mb-1 md:text-sm text-xs">
                  Content Type
                </p>
                <p className="md:text-xl text-xs">
                  {wikiData.contentType || "-"}
                </p>
              </div>

              <div className="col-span-2 md:col-span-1 mb-4">
                <p className="text-black/60 mb-1 md:text-sm text-xs">
                  Book Title / DOI / Website
                </p>
                <p className="md:text-xl text-xs">
                  {wikiData.bookTitle || "-"}
                </p>
              </div>

              <div className="col-span-2 md:col-span-1 mb-4">
                <p className="text-black/60 mb-1 md:text-sm text-xs">Chapter</p>
                <p className="md:text-xl text-xs">{wikiData.chapter || "-"}</p>
              </div>

              <div className="col-span-2 md:col-span-1 mb-4">
                <p className="text-black/60 mb-1 md:text-sm text-xs">Page</p>
                <p className="md:text-xl text-xs">{wikiData.page || "-"}</p>
              </div>
            </div>

            <div className="md:mb-12 mb-4 md:pt-8 pt-4">
              <p className="text-black/60 md:mb-4 md:text-sm text-xs">
                Content
              </p>
              <div className="md:text-xl text-xs whitespace-pre-wrap">
                {wikiData.content}
              </div>
            </div>

            <div className="text-black/50 text-xs md:text-sm">
              <p>Creation date: {formattedDate}</p>
              <p>Last edited: {wikiData.lastEditedTime}</p>
            </div>
          </div>

          {/* 相关词条部分 */}
          {relatedItems.length > 0 && (
            <div className="md:mt-16 mb-20">
              <h2 className="md:text-3xl text-xl font-bold md:mb-8 mb-4">
                Related items
              </h2>
              <Carousel className="w-full">
                <CarouselContent className="-ml-4">
                  {relatedItems.map((item) => (
                    <CarouselItem
                      key={item.id}
                      className="pl-4 text-xs md:text-sm md:basis-1/3 lg:basis-1/4"
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

  return isClient ? content : null;
}
