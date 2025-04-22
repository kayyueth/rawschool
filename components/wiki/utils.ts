import { WikiItem, WikiCard, ConceptCard } from "./types";
import { getUsernameByWalletAddress } from "@/lib/auth/userService";
import { supabase } from "@/lib/supabaseClient";

/**
 * Converts a WikiItem from the database to a WikiCard format for display
 */
export function wikiItemToCard(item: WikiItem): WikiCard {
  return {
    id: item.id || "",
    title: item["Wiki Name"],
    content: item["Content"],
    editor: item["Editor"],
    aiGenerated:
      typeof item["AI-generated"] === "string"
        ? item["AI-generated"] === "true"
        : !!item["AI-generated"],
    createdDate: item["Date"] || "",
    lastEditedTime: item["Last edited time"] || "",
    aiModel: item["AI model"] || null,
    bookTitle: item["Book Title / DOI / Website"] || null,
    contentType: item["Content Type"],
    chapter: item["Chapter"],
    page: item["Page"] || null,
    username: item["Username"] || null,
  };
}

/**
 * Converts a WikiItem from the database to a ConceptCard format for display
 */
export function wikiItemToConceptCard(item: WikiItem): ConceptCard {
  return {
    id: item.id || "",
    title: item["Wiki Name"],
    backContent: item["Content"],
    editor: item["Editor"],
    aiGenerated:
      typeof item["AI-generated"] === "string"
        ? item["AI-generated"] === "true"
        : !!item["AI-generated"],
    bookTitle: item["Book Title / DOI / Website"] || null,
    contentType: item["Content Type"],
    chapter: item["Chapter"],
    page: item["Page"] || null,
    username: item["Username"] || null,
  };
}

/**
 * Converts a WikiCard back to a WikiItem format for database operations
 */
export function wikiCardToItem(card: WikiCard): WikiItem {
  return {
    id: card.id,
    "Wiki Name": card.title,
    "Content Type": card.contentType,
    Chapter: card.chapter,
    Editor: card.editor,
    "AI-generated": card.aiGenerated,
    Date: card.createdDate,
    "Last edited time": card.lastEditedTime,
    "AI model": card.aiModel,
    Content: card.content,
    Page: card.page,
    "Book Title / DOI / Website": card.bookTitle,
    Username: card.username,
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
      .eq("Wiki Name", title)
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
      .order("Wiki Name", { ascending: true });

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
      .ilike("Wiki Name", `%${query}%`)
      .order("Wiki Name", { ascending: true });

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
      .eq("Editor", author)
      .order("Wiki Name", { ascending: true });

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
      .neq("Wiki Name", currentTitle)
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
