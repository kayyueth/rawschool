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
      const { email, password, username, display_name } = body;

      // 验证请求参数
      if (!email || !password) {
        return createErrorResponse("Email and password are required", 400);
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return createErrorResponse("Invalid email format", 400);
      }

      // 验证密码强度
      if (password.length < 8) {
        return createErrorResponse(
          "Password must be at least 8 characters long",
          400
        );
      }

      // 注册用户
      const { user, error } = await registerUser({
        email,
        password,
        username,
        display_name,
      });

      if (error) {
        return createErrorResponse(error, 400);
      }

      if (!user) {
        return createErrorResponse("Failed to create user", 500);
      }

      // 返回成功响应（不包含敏感信息）
      return createSuccessResponse({
        message:
          "User registered successfully. Please check your email for verification.",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          display_name: user.display_name,
        },
      });
    },
    "Registration failed",
    "User registration"
  );
}
