import { supabase } from "@/lib/supabaseClient";
import { BookclubData } from "@/types/bookclub";

export async function fetchAllBookclubData() {
  const { data, error } = await supabase
    .from("bookclub")
    .select("*")
    .order("id");

  if (error) throw error;
  return data;
}

export async function fetchBookclubById(id: number) {
  const { data, error } = await supabase
    .from("bookclub")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchBookReviews(bookId: number) {
  const { data, error } = await supabase
    .from("bookreview")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createBookReview(
  bookId: number,
  reviewer: string,
  review: string
) {
  const { data, error } = await supabase
    .from("bookreview")
    .insert([
      {
        book_id: bookId,
        reviewer,
        review,
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateBookReview(
  reviewId: number,
  reviewer: string,
  review: string
) {
  const { data, error } = await supabase
    .from("bookreview")
    .update({
      reviewer,
      review,
    })
    .eq("id", reviewId)
    .select();

  if (error) throw error;
  return data[0];
}

export async function deleteBookReview(reviewId: number) {
  const { error } = await supabase
    .from("bookreview")
    .delete()
    .eq("id", reviewId);

  if (error) throw error;
  return true;
}
