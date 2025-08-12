import { NextRequest } from "next/server";
import { validateSession } from "@/lib/auth/authService";
import { getCookie } from "@/lib/auth/cookieUtils";
import {
  createSuccessResponse,
  createErrorResponse,
  safeExecute,
} from "@/lib/api/apiUtils";

// 获取当前用户信息
export async function GET(request: NextRequest) {
  return safeExecute(
    async () => {
      // 从cookie中获取会话token
      const token = await getCookie("auth_token");

      if (!token) {
        return createSuccessResponse({ authenticated: false, user: null }, 200);
      }

      // 验证会话
      const user = await validateSession(token);

      if (!user) {
        return createSuccessResponse({ authenticated: false, user: null }, 200);
      }

      // 返回用户信息
      return createSuccessResponse({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          wallet_address: user.wallet_address,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
        },
      });
    },
    "获取当前用户失败",
    "用户信息"
  );
}
