import { NextRequest } from "next/server";
import { loginWithSocial } from "@/lib/auth/authService";
import {
  createSuccessResponse,
  createErrorResponse,
  safeExecute,
} from "@/lib/api/apiUtils";
import { SocialAuthRequest } from "@/types/auth";

export async function POST(request: NextRequest) {
  return safeExecute(
    async () => {
      const body: SocialAuthRequest = await request.json();
      const { provider, access_token, user_data } = body;

      // 验证请求参数
      if (!provider || !access_token) {
        return createErrorResponse(
          "Provider and access token are required",
          400
        );
      }

      // 验证提供商
      const validProviders = ["google", "github", "discord", "twitter"];
      if (!validProviders.includes(provider)) {
        return createErrorResponse("Invalid social provider", 400);
      }

      // 社交登录
      const { user, session, error } = await loginWithSocial({
        provider,
        access_token,
        user_data,
      });

      if (error) {
        return createErrorResponse(error, 401);
      }

      if (!user || !session) {
        return createErrorResponse("Social login failed", 500);
      }

      // 返回认证成功响应
      return createSuccessResponse({
        token: session.token,
        user: {
          id: user.id,
          email: user.email,
          social_email: user.social_email,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          social_provider: user.social_provider,
        },
        expires_at: session.expires_at,
        auth_method: session.auth_method,
      });
    },
    "Social login failed",
    "Social authentication"
  );
}
