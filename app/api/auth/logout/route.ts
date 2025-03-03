import { NextRequest } from "next/server";
import { deleteSession } from "@/lib/auth/authService";
import { getCookie } from "@/lib/auth/cookieUtils";
import {
  createSuccessResponse,
  createErrorResponse,
  safeExecute,
} from "@/lib/api/apiUtils";

// 处理登出请求
export async function POST(request: NextRequest) {
  return safeExecute(
    async () => {
      // 获取认证令牌
      const token = await getCookie("auth_token");

      if (!token) {
        return createSuccessResponse({ success: true });
      }

      // 删除会话
      const success = await deleteSession(token);

      if (!success) {
        return createErrorResponse("删除会话失败", 500);
      }

      // 返回成功响应
      return createSuccessResponse({ success: true });
    },
    "登出失败",
    "用户登出"
  );
}
