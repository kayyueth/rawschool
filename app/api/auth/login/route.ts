import { NextRequest } from "next/server";
import { loginWithEmail } from "@/lib/auth/authService";
import {
  createSuccessResponse,
  createErrorResponse,
  safeExecute,
} from "@/lib/api/apiUtils";
import { EmailAuthRequest } from "@/types/auth";

export async function POST(request: NextRequest) {
  return safeExecute(
    async () => {
      const body: EmailAuthRequest = await request.json();
      const { email, password } = body;

      // 验证请求参数
      if (!email || !password) {
        return createErrorResponse("Email and password are required", 400);
      }

      // 登录用户
      const { user, session, error } = await loginWithEmail({
        email,
        password,
      });

      if (error) {
        return createErrorResponse(error, 401);
      }

      if (!user || !session) {
        return createErrorResponse("Login failed", 500);
      }

      // 返回认证成功响应
      return createSuccessResponse({
        token: session.token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
        },
        expires_at: session.expires_at,
        auth_method: session.auth_method,
      });
    },
    "Login failed",
    "User login"
  );
}
