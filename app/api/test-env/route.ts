import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/apiUtils";

export async function GET(request: NextRequest) {
  try {
    const envInfo = {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? "SET" : "NOT SET",
      FROM_EMAIL: process.env.FROM_EMAIL || "NOT SET",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
      NODE_ENV: process.env.NODE_ENV || "NOT SET",
    };

    return createSuccessResponse(envInfo);
  } catch (error) {
    return createErrorResponse("Failed to get environment info", 500);
  }
}
