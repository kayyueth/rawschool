import { NextRequest } from "next/server";
import { verifyEmail } from "@/lib/auth/authService";
import {
  createSuccessResponse,
  createErrorResponse,
  safeExecute,
} from "@/lib/api/apiUtils";

export async function POST(request: NextRequest) {
  return safeExecute(
    async () => {
      const body = await request.json();
      const { token } = body;

      // 验证请求参数
      if (!token) {
        return createErrorResponse("Verification token is required", 400);
      }

      // 验证邮箱
      const { success, error } = await verifyEmail(token);

      if (error) {
        return createErrorResponse(error, 400);
      }

      return createSuccessResponse({
        message: "Email verified successfully",
      });
    },
    "Email verification failed",
    "Email verification"
  );
}
