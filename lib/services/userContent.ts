import { supabase } from "@/lib/supabaseClient";
import { BookclubReview, AmbientCard } from "@/types";

/**
 * 获取用户的所有 BookclubReview
 */
export async function fetchUserBookclubReviews(userId: string) {
  const { data, error } = await supabase
    .from("bookreview")
    .select("*")
    .eq("reviewer", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // 转换数据格式以匹配 BookclubReview 接口
  return data.map((item) => ({
    id: item.id,
    user_id: userId,
    wallet_address: userId, // 使用 userId 作为钱包地址
    title: `Book Review #${item.book_id}`, // 使用 book_id 作为标题
    content: item.review,
    book_id: item.book_id,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.created_at || new Date().toISOString(),
  })) as BookclubReview[];
}

/**
 * 获取指定钱包地址的所有 BookclubReview
 */
export async function fetchWalletBookclubReviews(walletAddress: string) {
  const { data, error } = await supabase
    .from("bookreview")
    .select("*")
    .eq("reviewer", walletAddress)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // 转换数据格式以匹配 BookclubReview 接口
  return data.map((item) => ({
    id: item.id,
    user_id: walletAddress, // 使用钱包地址作为用户ID
    wallet_address: walletAddress,
    title: `Book Review #${item.book_id}`, // 使用 book_id 作为标题
    content: item.review,
    book_id: item.book_id,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.created_at || new Date().toISOString(),
  })) as BookclubReview[];
}

/**
 * 创建新的 BookclubReview
 */
export async function createBookclubReview(
  userId: string,
  walletAddress: string,
  title: string,
  content: string,
  bookId: number = 1 // 默认 book_id 为 1
) {
  const { data, error } = await supabase
    .from("bookreview")
    .insert([
      {
        book_id: bookId,
        reviewer: walletAddress, // 使用钱包地址作为 reviewer
        review: content,
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) throw error;

  // 转换返回的数据
  return {
    id: data[0].id,
    user_id: userId,
    wallet_address: walletAddress,
    title: title,
    content: data[0].review,
    book_id: data[0].book_id,
    created_at: data[0].created_at,
    updated_at: data[0].created_at,
  } as BookclubReview;
}

/**
 * 更新 BookclubReview
 */
export async function updateBookclubReview(
  reviewId: string,
  content: string,
  bookId?: number
) {
  const updateData: any = {
    review: content,
  };

  if (bookId) {
    updateData.book_id = bookId;
  }

  const { data, error } = await supabase
    .from("bookreview")
    .update(updateData)
    .eq("id", reviewId)
    .select();

  if (error) throw error;

  // 获取更新后的数据
  const { data: updatedReview } = await supabase
    .from("bookreview")
    .select("*")
    .eq("id", reviewId)
    .single();

  return {
    id: updatedReview.id,
    user_id: updatedReview.reviewer,
    wallet_address: updatedReview.reviewer,
    title: `Book Review #${updatedReview.book_id}`,
    content: updatedReview.review,
    book_id: updatedReview.book_id,
    created_at: updatedReview.created_at,
    updated_at: new Date().toISOString(),
  } as BookclubReview;
}

/**
 * 删除 BookclubReview
 */
export async function deleteBookclubReview(reviewId: string) {
  const { error } = await supabase
    .from("bookreview")
    .delete()
    .eq("id", reviewId);

  if (error) throw error;
  return true;
}

/**
 * 获取用户的所有 AmbientCard
 */
export async function fetchUserAmbientCards(userId: string) {
  const { data, error } = await supabase
    .from("wiki")
    .select("*")
    .eq("Author", userId)
    .order("Date", { ascending: false });

  if (error) throw error;

  // 转换数据格式以匹配 AmbientCard 接口
  return data.map((item) => ({
    id: item.id,
    user_id: userId,
    wallet_address: userId, // 使用 userId 作为钱包地址
    title: item["词条名称"],
    content: item["内容"],
    created_at: item.Date || new Date().toISOString(),
    updated_at: item["Last edited time"] || new Date().toISOString(),
  })) as AmbientCard[];
}

/**
 * 获取指定钱包地址的所有 AmbientCard
 */
export async function fetchWalletAmbientCards(walletAddress: string) {
  const { data, error } = await supabase
    .from("wiki")
    .select("*")
    .eq("Author", walletAddress)
    .order("Date", { ascending: false });

  if (error) throw error;

  // 转换数据格式以匹配 AmbientCard 接口
  return data.map((item) => ({
    id: item.id,
    user_id: walletAddress, // 使用钱包地址作为用户ID
    wallet_address: walletAddress,
    title: item["词条名称"],
    content: item["内容"],
    created_at: item.Date || new Date().toISOString(),
    updated_at: item["Last edited time"] || new Date().toISOString(),
  })) as AmbientCard[];
}

/**
 * 创建新的 AmbientCard
 */
export async function createAmbientCard(
  userId: string,
  walletAddress: string,
  title: string,
  content: string
) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("wiki")
    .insert([
      {
        词条名称: title,
        内容: content,
        "定义/解释/翻译校对": "用户创建",
        "来源Soucre / 章节 Chapter": "用户内容",
        Author: walletAddress, // 使用钱包地址作为作者
        "人工智能生成 AI-generated": false,
        Date: now,
        "Last edited time": now,
      },
    ])
    .select();

  if (error) throw error;

  // 转换返回的数据
  return {
    id: data[0].id,
    user_id: userId,
    wallet_address: walletAddress,
    title: data[0]["词条名称"],
    content: data[0]["内容"],
    created_at: data[0].Date,
    updated_at: data[0]["Last edited time"],
  } as AmbientCard;
}

/**
 * 更新 AmbientCard
 */
export async function updateAmbientCard(
  cardId: string,
  title: string,
  content: string
) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("wiki")
    .update({
      词条名称: title,
      内容: content,
      "Last edited time": now,
    })
    .eq("id", cardId)
    .select();

  if (error) throw error;

  // 获取更新后的数据
  const { data: updatedCard } = await supabase
    .from("wiki")
    .select("*")
    .eq("id", cardId)
    .single();

  return {
    id: updatedCard.id,
    user_id: updatedCard.Author,
    wallet_address: updatedCard.Author,
    title: updatedCard["词条名称"],
    content: updatedCard["内容"],
    created_at: updatedCard.Date,
    updated_at: updatedCard["Last edited time"],
  } as AmbientCard;
}

/**
 * 删除 AmbientCard
 */
export async function deleteAmbientCard(cardId: string) {
  const { error } = await supabase.from("wiki").delete().eq("id", cardId);

  if (error) throw error;
  return true;
}
