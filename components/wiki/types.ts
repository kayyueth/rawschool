export interface WikiItem {
  id?: string;
  词条名称: string; // Title
  "定义/解释/翻译校对": string; // Definition/Explanation
  "来源Soucre / 章节 Chapter": string; // Source/Chapter
  Property?: string; // Type/Category
  "人工智能生成 AI-generated": boolean; // AI Generated flag
  Date?: string; // Creation date
  "Last edited time"?: string; // Last edited timestamp
  人工智能模型?: string | null; // AI Model used
  内容: string; // Content
  Author: string; // Author wallet address
  wallet_address?: string | null; // Duplicate of Author, kept for backward compatibility
}

/**
 * Standardized format for wiki entries used in the UI
 */
export interface WikiCard {
  id: string;
  title: string; // 词条名称
  content: string; // 内容
  definition: string; // 定义/解释/翻译校对
  source: string; // 来源Soucre / 章节 Chapter
  author: string; // Author
  aiGenerated: boolean; // 人工智能生成 AI-generated
  createdDate: string; // Date
  lastEditedTime: string; // Last edited time
  aiModel: string | null; // 人工智能模型
}

/**
 * Format for concept cards used in the flip card UI
 */
export interface ConceptCard {
  id: string;
  title: string; // 词条名称
  frontContent: string; // 定义/解释/翻译校对
  backContent: string; // 内容
  author: string; // Author
  source: string; // 来源Soucre / 章节 Chapter
  type: string; // Property
  aiGenerated: boolean; // 人工智能生成 AI-generated
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
