import { WikiItem, WikiCard, ConceptCard } from "./types";
import { getUsernameByWalletAddress } from "@/lib/auth/userService";
import { supabase } from "@/lib/supabaseClient";

/**
 * Converts a WikiItem from the database to a WikiCard format for display
 */
export function wikiItemToCard(item: WikiItem): WikiCard {
  return {
    id: item.id || "",
    title: item.词条名称,
    content: item.内容,
    author: item.Author,
    aiGenerated:
      typeof item["人工智能生成 AI-generated"] === "string"
        ? item["人工智能生成 AI-generated"] === "true"
        : !!item["人工智能生成 AI-generated"],
    createdDate: item.Date || "",
    lastEditedTime: item["Last edited time"] || "",
    aiModel: item.人工智能模型 || null,
    bookTitle: item.book_title,
    contentType: item.content_type,
    chapter: item.chapter,
    page: item.page,
  };
}

/**
 * Converts a WikiItem from the database to a ConceptCard format for display
 */
export function wikiItemToConceptCard(item: WikiItem): ConceptCard {
  return {
    id: item.id || "",
    title: item.词条名称,
    backContent: item.内容,
    author: item.Author,
    aiGenerated:
      typeof item["人工智能生成 AI-generated"] === "string"
        ? item["人工智能生成 AI-generated"] === "true"
        : !!item["人工智能生成 AI-generated"],
    bookTitle: item.book_title,
    contentType: item.content_type,
    chapter: item.chapter,
    page: item.page,
  };
}

/**
 * Converts a WikiCard back to a WikiItem format for database operations
 */
export function wikiCardToItem(card: WikiCard): WikiItem {
  return {
    id: card.id,
    词条名称: card.title,
    "人工智能生成 AI-generated": card.aiGenerated,
    内容: card.content,
    Author: card.author,
    人工智能模型: card.aiModel,
    Date: card.createdDate,
    "Last edited time": card.lastEditedTime,
    book_title: card.bookTitle,
    content_type: card.contentType,
    chapter: card.chapter,
    page: card.page,
  };
}

/**
 * Fetches the username for a wallet address
 */
export async function fetchAuthorUsername(
  walletAddress: string
): Promise<string | null> {
  try {
    return await getUsernameByWalletAddress(walletAddress);
  } catch (error) {
    console.error("Failed to fetch author username:", error);
    return null;
  }
}

/**
 * Fetches a wiki item by title
 */
export async function fetchWikiItemByTitle(
  title: string
): Promise<WikiItem | null> {
  try {
    const { data, error } = await supabase
      .from("wiki")
      .select("*")
      .eq("词条名称", title)
      .single();

    if (error) {
      console.error("Error fetching wiki item:", error);
      return null;
    }

    return data as WikiItem;
  } catch (error) {
    console.error("Failed to fetch wiki item:", error);
    return null;
  }
}

/**
 * Fetches all wiki items
 */
export async function fetchAllWikiItems(): Promise<WikiItem[]> {
  try {
    const { data, error } = await supabase
      .from("wiki")
      .select("*")
      .order("词条名称", { ascending: true });

    if (error) {
      console.error("Error fetching wiki items:", error);
      return [];
    }

    return data as WikiItem[];
  } catch (error) {
    console.error("Failed to fetch wiki items:", error);
    return [];
  }
}

/**
 * Searches wiki items by query
 */
export async function searchWikiItems(query: string): Promise<WikiItem[]> {
  try {
    const { data, error } = await supabase
      .from("wiki")
      .select("*")
      .ilike("词条名称", `%${query}%`)
      .order("词条名称", { ascending: true });

    if (error) {
      console.error("Error searching wiki items:", error);
      return [];
    }

    return data as WikiItem[];
  } catch (error) {
    console.error("Failed to search wiki items:", error);
    return [];
  }
}

/**
 * Searches wiki items by author
 */
export async function searchWikiItemsByAuthor(
  author: string
): Promise<WikiItem[]> {
  try {
    const { data, error } = await supabase
      .from("wiki")
      .select("*")
      .eq("Author", author)
      .order("词条名称", { ascending: true });

    if (error) {
      console.error("Error searching wiki items by author:", error);
      return [];
    }

    return data as WikiItem[];
  } catch (error) {
    console.error("Failed to search wiki items by author:", error);
    return [];
  }
}

/**
 * Fetches related wiki items by title
 */
export async function fetchRelatedWikiItems(
  currentTitle: string
): Promise<WikiItem[]> {
  try {
    const { data, error } = await supabase
      .from("wiki")
      .select("*")
      .neq("词条名称", currentTitle)
      .limit(5);

    if (error) {
      console.error("Error fetching related items:", error);
      return [];
    }

    return (data as WikiItem[]) || [];
  } catch (error) {
    console.error("Error fetching related items:", error);
    return [];
  }
}
