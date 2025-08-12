import { NextRequest } from "next/server";
import {
  verifySignature,
  createSignMessage,
  createSession,
} from "@/lib/auth/authService";
import { getOrCreateUser } from "@/lib/auth/userService";
import {
  createSuccessResponse,
  createErrorResponse,
  safeExecute,
} from "@/lib/api/apiUtils";

// 处理签名验证请求
export async function POST(request: NextRequest) {
  return safeExecute(
    async () => {
      // 解析请求体
      const body = await request.json();
      const { wallet_address, signature } = body;

      // 验证请求参数
      if (!wallet_address || !signature) {
        return createErrorResponse(
          "Wallet address and signature are required",
          400
        );
      }

      // 获取用户
      const user = await getOrCreateUser(wallet_address);

      if (!user) {
        return createErrorResponse("User not found", 404);
      }

      if (!user.nonce) {
        return createErrorResponse("User nonce not found", 500);
      }

      // 创建签名消息
      const message = await createSignMessage(wallet_address, user.nonce);

      // 验证签名
      const isValid = await verifySignature(message, signature, wallet_address);

      if (!isValid) {
        return createErrorResponse("Signature verification failed", 401);
      }

      // 创建会话
      const session = await createSession(user.id, "wallet");

      if (!session) {
        return createErrorResponse("Failed to create session", 500);
      }

      // 返回认证成功响应
      return createSuccessResponse({
        token: session.token,
        user: {
          id: user.id,
          wallet_address: user.wallet_address,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
        },
        expires_at: session.expires_at,
        auth_method: session.auth_method,
      });
    },
    "Signature verification failed",
    "Verify signature"
  );
}
