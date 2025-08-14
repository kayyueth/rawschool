import { NextRequest } from "next/server";
import { testEmailService } from "@/lib/services/emailService";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/apiUtils";

export async function POST(request: NextRequest) {
  try {
    const result = await testEmailService();
    
    if (result.success) {
      return createSuccessResponse({ message: "Email service is working correctly" });
    } else {
      return createErrorResponse(result.error || "Email service test failed", 500);
    }
  } catch (error) {
    return createErrorResponse("Email service test failed", 500);
  }
}
