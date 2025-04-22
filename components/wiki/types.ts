/**
 * Wiki data types and interfaces
 *
 * Schema update (April 2023):
 * Old schema:
 * - 词条名称 -> "Wiki Name"
 * - 内容 -> "Content"
 * - "人工智能生成 AI-generated" -> "AI-generated"
 * - Author -> "Editor"
 * - 人工智能模型 -> "AI model"
 * - book_title -> "Book Title / DOI / Website"
 * - content_type -> "Content Type"
 * - chapter -> "Chapter"
 * - page -> "Page"
 *
 * Added new fields:
 * - "Username": Username of the editor
 *
 * This update standardizes the field names and makes them more consistent
 * with the English interface while maintaining backward compatibility.
 */

export interface WikiItem {
  id?: string;
  "Wiki Name": string; // Title
  "Content Type": string; // Content type: "One Line" or "Paragraph"
  Chapter: string; // Chapter
  Editor: string; // Editor name
  "AI-generated": boolean; // AI Generated flag
  Date?: string; // Creation date
  "Last edited time"?: string; // Last edited timestamp
  "AI model"?: string | null; // AI Model used
  Content: string; // Content
  Page?: string | null; // Page number
  "Book Title / DOI / Website"?: string | null; // Book title
  Username?: string | null; // Username
}

/**
 * Standardized format for wiki entries used in the UI
 */
export interface WikiCard {
  id: string;
  title: string; // Wiki Name
  content: string; // Content
  editor: string; // Editor
  aiGenerated: boolean; // AI-generated
  createdDate: string; // Date
  lastEditedTime: string; // Last edited time
  aiModel: string | null; // AI model
  bookTitle: string | null; // Book Title / DOI / Website
  contentType: string; // Content Type
  chapter: string; // Chapter
  page: string | null; // Page
  username: string | null; // Username
}

/**
 * Format for concept cards used in the flip card UI
 */
export interface ConceptCard {
  id: string;
  title: string; // Wiki Name
  backContent: string; // Content
  editor: string; // Editor
  aiGenerated: boolean; // AI-generated
  bookTitle: string | null; // Book Title / DOI / Website
  contentType: string; // Content Type
  chapter: string; // Chapter
  page: string | null; // Page
  username: string | null; // Username
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
