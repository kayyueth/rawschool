import { NextRequest } from "next/server";
import { registerUser } from "@/lib/auth/authService";
import {
  createSuccessResponse,
  createErrorResponse,
  safeExecute,
} from "@/lib/api/apiUtils";
import { RegisterRequest } from "@/types/auth";

export async function POST(request: NextRequest) {
  return safeExecute(
    async () => {
      const body: RegisterRequest = await request.json();
      const { username, wallet_address } = body;

      // 验证请求参数
      if (!wallet_address) {
        return createErrorResponse("Wallet address is required", 400);
      }

      // 验证钱包地址格式
      const walletRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!walletRegex.test(wallet_address)) {
        return createErrorResponse("Invalid wallet address format", 400);
      }

      // 注册用户
      const { user, error } = await registerUser({
        username,
        wallet_address,
      });

      if (error) {
        return createErrorResponse(error, 400);
      }

      if (!user) {
        return createErrorResponse("Failed to create user", 500);
      }

      // 返回成功响应
      return createSuccessResponse({
        message:
          "User registered successfully. Please sign the message to complete authentication.",
        user: {
          id: user.id,
          wallet_address: user.wallet_address,
          username: user.username,
        },
      });
    },
    "Registration failed",
    "User registration"
  );
}
