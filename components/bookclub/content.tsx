"use client";
import { ArrowRight, ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BookclubData {
  id: number;
  season: string;
  title: string;
  people: string;
  description: string;
}

interface BookReview {
  id: number;
  book_id: number;
  reviewer: string;
  review: string;
  created_at: string;
}

interface ContentProps {
  selectedData?: BookclubData | null;
}

export default function Content({ selectedData }: ContentProps) {
  const [content, setContent] = useState<BookclubData | null>(null);
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [newReview, setNewReview] = useState({
    reviewer: "",
    review: "",
  });
  const [currentReviewer, setCurrentReviewer] = useState<string>("");

  useEffect(() => {
    // If selectedData is provided, use it directly
    if (selectedData) {
      setContent(selectedData);
      // Fetch reviews for the selected book
      fetchReviews(selectedData.id);
      setLoading(false);
      return;
    }

    // Otherwise fetch the first record as default
    async function fetchContent() {
      try {
        const { data, error } = await supabase
          .from("bookclub")
          .select("*")
          .order("month", { ascending: true })
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          setContent(data[0]);
          // Fetch reviews for the default book
          fetchReviews(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [selectedData]);

  const fetchReviews = async (bookId: number) => {
    try {
      const { data, error } = await supabase
        .from("bookreview")
        .select("*")
        .eq("book_id", bookId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!content || !newReview.reviewer || !newReview.review) return;

    try {
      if (isEditMode && editingReviewId) {
        // Check if the current reviewer matches the original reviewer
        const reviewToEdit = reviews.find((r) => r.id === editingReviewId);
        if (reviewToEdit?.reviewer !== currentReviewer) {
          console.error("You can only edit your own reviews");
          return;
        }

        const { data, error } = await supabase
          .from("bookreview")
          .update({
            reviewer: newReview.reviewer,
            review: newReview.review,
          })
          .eq("id", editingReviewId)
          .select();

        if (error) throw error;

        if (data) {
          setReviews(
            reviews.map((review) =>
              review.id === editingReviewId ? data[0] : review
            )
          );
        }
      } else {
        const { data, error } = await supabase
          .from("bookreview")
          .insert([
            {
              book_id: content.id,
              reviewer: newReview.reviewer,
              review: newReview.review,
              created_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) throw error;

        if (data) {
          setReviews([data[0], ...reviews]);
          // Set current reviewer when adding a new review
          setCurrentReviewer(newReview.reviewer);
        }
      }

      setNewReview({ reviewer: "", review: "" });
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingReviewId(null);
    } catch (error) {
      console.error("Error handling review:", error);
    }
  };

  const handleEditReview = (review: BookReview) => {
    if (review.reviewer !== currentReviewer) {
      console.error("You can only edit your own reviews");
      return;
    }

    setNewReview({
      reviewer: review.reviewer,
      review: review.review,
    });
    setEditingReviewId(review.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    const reviewToDelete = reviews.find((r) => r.id === reviewId);
    if (reviewToDelete?.reviewer !== currentReviewer) {
      console.error("You can only delete your own reviews");
      return;
    }

    try {
      const { error } = await supabase
        .from("bookreview")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;

      setReviews(reviews.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  if (loading)
    return <div className="text-2xl flex mt-20 ml-10">loading...</div>;
  if (!content)
    return <div className="text-2xl flex mt-20 ml-10">no content</div>;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="mt-10 text-left">
      {!showReviews ? (
        <>
          <button
            onClick={() => setShowReviews(true)}
            className="text-black text-md font-bold flex justify-end hover:opacity-50 transition-opacity"
          >
            BOOKCLUB REVIEW <ArrowRight className="ml-2" />
          </button>
          <h3 className="w-[250px] border border-black rounded-full p-2 text-center text-xl mt-40 ml-10">
            {content.season}
          </h3>
          <h1 className="text-2xl font-bold mt-5 ml-10">{content.title}</h1>
          <p className="text-xl mt-2 ml-10">Guest: {content.people}</p>
          <p className="mt-2 mb-6 ml-10 max-w-[800px]">{content.description}</p>
        </>
      ) : (
        <div className="h-[800px] flex flex-col">
          <div className="absolute right-20">
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setNewReview({ reviewer: "", review: "" });
                  setIsEditMode(false);
                  setEditingReviewId(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-[#FCFADE]"
                >
                  <Plus className="h-4 w-4" /> Add Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? "Edit Review" : "Add a Review"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reviewer</label>
                    <Input
                      value={newReview.reviewer}
                      onChange={(e) =>
                        setNewReview({ ...newReview, reviewer: e.target.value })
                      }
                      placeholder="Your name"
                      disabled={isEditMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review</label>
                    <Textarea
                      value={newReview.review}
                      onChange={(e) =>
                        setNewReview({ ...newReview, review: e.target.value })
                      }
                      placeholder="Write your review here..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button
                    onClick={handleSubmitReview}
                    className="w-full"
                    disabled={!newReview.reviewer || !newReview.review}
                  >
                    {isEditMode ? "Update Review" : "Submit Review"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <button
            onClick={() => setShowReviews(false)}
            className="text-black text-md font-bold flex items-center mb-8 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="mr-2" /> BACK TO BOOK
          </button>
          <h1 className="text-2xl font-bold mb-8 mt-6 text-left">
            {content.title}
          </h1>
          <div className="space-y-8 text-left overflow-y-auto flex-1 pr-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-black pb-6 relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xl font-bold">{review.reviewer}</p>
                    <p className="text-sm text-gray-600 mb-4">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                  {review.reviewer === currentReviewer && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditReview(review)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="whitespace-pre-line">{review.review}</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-center text-gray-500">No reviews yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
