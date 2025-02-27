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
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
