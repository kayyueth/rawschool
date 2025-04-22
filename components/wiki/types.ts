export interface WikiItem {
  id?: string;
  词条名称: string; // Title
  "人工智能生成 AI-generated": boolean; // AI Generated flag
  Date?: string; // Creation date
  "Last edited time"?: string; // Last edited timestamp
  人工智能模型?: string | null; // AI Model used
  内容: string; // Content
  Author: string; // Author wallet address
  wallet_address?: string | null; // Duplicate of Author, kept for backward compatibility
  book_title: string; // Book title / DOI / Website
  content_type: "one-line" | "paragraph"; // Content type
  chapter: string; // Chapter
  page: string; // Page number
}

/**
 * Standardized format for wiki entries used in the UI
 */
export interface WikiCard {
  id: string;
  title: string; // 词条名称
  content: string; // 内容
  author: string; // Author
  aiGenerated: boolean; // 人工智能生成 AI-generated
  createdDate: string; // Date
  lastEditedTime: string; // Last edited time
  aiModel: string | null; // 人工智能模型
  bookTitle: string; // Book title / DOI / Website
  contentType: "one-line" | "paragraph"; // Content type
  chapter: string; // Chapter
  page: string; // Page number
}

/**
 * Format for concept cards used in the flip card UI
 */
export interface ConceptCard {
  id: string;
  title: string; // 词条名称
  backContent: string; // 内容
  author: string; // Author
  aiGenerated: boolean; // 人工智能生成 AI-generated
  bookTitle: string; // Book title / DOI / Website
  contentType: "one-line" | "paragraph"; // Content type
  chapter: string; // Chapter
  page: string; // Page number
}

/**
 * Available view types for the wiki interface
 */
export type WikiViewType =
  | "book"
  | "reviews"
  | "join"
  | "wiki"
  | "wikiData"
  | "wikiDetail";
