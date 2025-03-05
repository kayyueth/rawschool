import { supabase } from "@/lib/supabaseClient";
import { BookclubReview, AmbientCard } from "@/types";
import { v4 as uuidv4 } from "uuid";

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
    title: item.title,
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
  // 首先获取用户的所有评论
  const { data, error } = await supabase
    .from("bookreview")
    .select("*")
    .eq("reviewer", walletAddress)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // 如果没有评论，直接返回空数组
  if (!data || data.length === 0) {
    return [] as BookclubReview[];
  }

  // 获取所有相关的book_id
  const bookIds = [...new Set(data.map((item) => item.book_id))];

  // 从bookclub表中获取对应的书籍信息
  const { data: bookData, error: bookError } = await supabase
    .from("bookclub")
    .select("id, title")
    .in("id", bookIds);

  if (bookError) {
    console.error("获取书籍信息失败:", bookError);
    // 如果获取书籍信息失败，仍然使用原来的格式
    return data.map((item) => ({
      id: item.id,
      user_id: walletAddress,
      wallet_address: walletAddress,
      title: `Book Review #${item.book_id}`, // 使用 book_id 作为标题
      content: item.review,
      book_id: item.book_id,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.created_at || new Date().toISOString(),
    })) as BookclubReview[];
  }

  // 创建book_id到title的映射
  const bookTitleMap: Record<number, string> = {};
  bookData.forEach((book) => {
    bookTitleMap[book.id] = book.title;
  });

  // 转换数据格式以匹配 BookclubReview 接口，使用bookclub表中的title
  return data.map((item) => ({
    id: item.id,
    user_id: walletAddress,
    wallet_address: walletAddress,
    title: bookTitleMap[item.book_id] || `Book Review #${item.book_id}`, // 优先使用bookclub中的title
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
  // 插入评论数据
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

  // 从bookclub表中获取对应的书籍标题
  const { data: bookData, error: bookError } = await supabase
    .from("bookclub")
    .select("title")
    .eq("id", bookId)
    .single();

  let bookTitle = title; // 默认使用传入的标题

  // 如果成功获取到书籍标题，则使用书籍标题
  if (!bookError && bookData) {
    bookTitle = bookData.title;
  }

  // 转换返回的数据
  return {
    id: data[0].id,
    user_id: userId,
    wallet_address: walletAddress,
    title: bookTitle,
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

  // 更新评论
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

  // 从bookclub表中获取对应的书籍标题
  const { data: bookData, error: bookError } = await supabase
    .from("bookclub")
    .select("title")
    .eq("id", updatedReview.book_id)
    .single();

  let bookTitle = `Book Review #${updatedReview.book_id}`; // 默认标题格式

  // 如果成功获取到书籍标题，则使用书籍标题
  if (!bookError && bookData) {
    bookTitle = bookData.title;
  }

  return {
    id: updatedReview.id,
    user_id: updatedReview.reviewer,
    wallet_address: updatedReview.reviewer,
    title: bookTitle,
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
        id: uuidv4(), // 生成唯一ID
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
 * @param cardId 要更新的卡片ID
 * @param title 新标题
 * @param content 新内容
 * @param walletAddress 当前用户的钱包地址，用于权限验证
 * @returns 更新后的卡片数据
 */
export async function updateAmbientCard(
  cardId: string,
  title: string,
  content: string,
  walletAddress: string
) {
  // 首先检查该条目是否属于当前用户
  const { data, error: fetchError } = await supabase
    .from("wiki")
    .select("Author")
    .eq("id", cardId)
    .single();

  if (fetchError) {
    if (fetchError.code === "PGRST116") {
      // 记录不存在
      throw new Error("条目不存在");
    }
    throw fetchError;
  }

  // 验证所有权
  if (data.Author.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error("您没有权限更新此条目");
  }

  const now = new Date().toISOString();

  const { data: updateData, error } = await supabase
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
 * @param cardId 要删除的卡片ID
 * @param walletAddress 当前用户的钱包地址，用于权限验证
 * @returns 是否删除成功
 */
export async function deleteAmbientCard(cardId: string, walletAddress: string) {
  // 首先检查该条目是否属于当前用户
  const { data, error: fetchError } = await supabase
    .from("wiki")
    .select("Author")
    .eq("id", cardId)
    .single();

  if (fetchError) {
    if (fetchError.code === "PGRST116") {
      // 记录不存在
      throw new Error("条目不存在");
    }
    throw fetchError;
  }

  // 验证所有权
  if (data.Author.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error("您没有权限删除此条目");
  }

  // 执行删除操作
  const { error } = await supabase.from("wiki").delete().eq("id", cardId);

  if (error) throw error;
  return true;
}
