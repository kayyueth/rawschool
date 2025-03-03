import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/authService";
import {
  createSuccessResponse,
  createErrorResponse,
  safeExecute,
} from "@/lib/api/apiUtils";

// 获取当前用户信息
export async function GET(request: NextRequest) {
  return safeExecute(
    async () => {
      // 获取当前用户
      const user = await getCurrentUser();

      if (!user) {
        return createErrorResponse("未认证", 401);
      }

      // 返回用户信息
      return createSuccessResponse({
        authenticated: true,
        user: {
          id: user.id,
          wallet_address: user.wallet_address,
        },
      });
    },
    "获取当前用户失败",
    "用户信息"
  );
}
