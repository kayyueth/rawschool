import { NextRequest } from "next/server";
import {
  getOrCreateUser,
  verifySignature,
  createSignMessage,
  createSession,
} from "@/lib/auth/authService";
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
        return createErrorResponse("钱包地址和签名是必需的", 400);
      }

      // 获取用户
      const user = await getOrCreateUser(wallet_address);

      if (!user) {
        return createErrorResponse("用户不存在", 404);
      }

      // 创建签名消息
      const message = createSignMessage(wallet_address, user.nonce);

      // 验证签名
      const isValid = verifySignature(message, signature, wallet_address);

      if (!isValid) {
        return createErrorResponse("签名验证失败", 401);
      }

      // 创建会话
      const session = await createSession(user.id);

      if (!session) {
        return createErrorResponse("创建会话失败", 500);
      }

      // 返回认证成功响应
      return createSuccessResponse({
        token: session.token,
        user: {
          id: user.id,
          wallet_address: user.wallet_address,
        },
        expires_at: session.expires_at,
      });
    },
    "签名验证失败",
    "验证签名"
  );
}
