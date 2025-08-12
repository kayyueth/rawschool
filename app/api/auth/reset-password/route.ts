import { NextRequest } from "next/server";
import {
  requestPasswordReset,
  confirmPasswordReset,
} from "@/lib/auth/authService";
import {
  createSuccessResponse,
  createErrorResponse,
  safeExecute,
} from "@/lib/api/apiUtils";

export async function POST(request: NextRequest) {
  return safeExecute(
    async () => {
      const body = await request.json();
      const { email, token, new_password } = body;

      // 密码重置请求
      if (email && !token && !new_password) {
        if (!email) {
          return createErrorResponse("Email is required", 400);
        }

        const { success, error } = await requestPasswordReset(email);

        if (error) {
          return createErrorResponse(error, 500);
        }

        return createSuccessResponse({
          message: "Password reset email sent successfully",
        });
      }

      // 密码重置确认
      if (token && new_password && !email) {
        if (!token || !new_password) {
          return createErrorResponse(
            "Token and new password are required",
            400
          );
        }

        if (new_password.length < 8) {
          return createErrorResponse(
            "Password must be at least 8 characters long",
            400
          );
        }

        const { success, error } = await confirmPasswordReset(
          token,
          new_password
        );

        if (error) {
          return createErrorResponse(error, 400);
        }

        return createSuccessResponse({
          message: "Password reset successfully",
        });
      }

      return createErrorResponse("Invalid request parameters", 400);
    },
    "Password reset failed",
    "Password reset"
  );
}
