// 统一导出所有类型
export * from "./bookclub";
export * from "./reviews";

export interface AmbientCard {
  id: string;
  user_id: string;
  wallet_address: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
