import { createClient } from "@supabase/supabase-js";
import { logger } from "./logger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 检查环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = "缺少Supabase环境变量配置";
  logger.error(errorMessage);
  throw new Error(errorMessage);
}

// 创建并导出Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// 添加错误处理的辅助函数
export const handleSupabaseError = (error: unknown): string => {
  const errorMessage =
    error instanceof Error ? error.message : "未知Supabase错误";

  logger.error("Supabase操作失败", { error });
  return errorMessage;
};
