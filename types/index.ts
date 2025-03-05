// 统一导出所有类型
export * from "./auth";
export * from "./user";
export * from "./bookclub";
export * from "./reviews";

// 通用卡片类型
export interface AmbientCard {
  id: string;
  user_id: string;
  wallet_address: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  likes_count?: number;
  views_count?: number;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
