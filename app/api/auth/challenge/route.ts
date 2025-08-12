import { NextRequest } from "next/server";
import { createSignMessage } from "@/lib/auth/authService";
import { getOrCreateUser } from "@/lib/auth/userService";
import {
  createSuccessResponse,
  createErrorResponse,
  safeExecute,
} from "@/lib/api/apiUtils";

// 处理认证挑战请求
export async function POST(request: NextRequest) {
  return safeExecute(
    async () => {
      // 解析请求体
      const body = await request.json();
      const { wallet_address } = body;

      // 验证请求参数
      if (!wallet_address) {
        return createErrorResponse("钱包地址是必需的", 400);
      }

      // 获取或创建用户
      const user = await getOrCreateUser(wallet_address);

      if (!user) {
        return createErrorResponse("创建用户失败", 500);
      }

      if (!user.nonce) {
        return createErrorResponse("缺少用户nonce", 500);
      }

      // 创建签名消息
      const message = await createSignMessage(wallet_address, user.nonce);

      // 返回挑战
      return createSuccessResponse({
        nonce: user.nonce,
        message,
      });
    },
    "认证挑战生成失败",
    "认证挑战"
  );
}
