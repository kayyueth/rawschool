import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/apiUtils";
import { sendEmailVerification } from "@/lib/services/emailService";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    console.log("Testing email verification flow...");
    console.log("FROM_EMAIL:", process.env.FROM_EMAIL);

    // Generate a test verification token
    const testToken = uuidv4();
    const testEmail = "yukiyukaiyue@gmail.com"; // Use your email for testing
    const testUsername = "TestUser";

    console.log("Sending verification email with token:", testToken);

    // Send the verification email
    const result = await sendEmailVerification(
      testEmail,
      testToken,
      testUsername
    );

    if (!result.success) {
      console.error("Email verification test failed:", result.error);
      return createErrorResponse(
        `Email verification test failed: ${result.error}`,
        500
      );
    }

    console.log("Email verification test successful");
    return createSuccessResponse({
      message: "Verification email sent successfully",
      token: testToken, // Include token for testing purposes
      email: testEmail,
      verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${testToken}`,
    });
  } catch (error) {
    console.error("Error testing email verification", error);
    return createErrorResponse(
      `Email verification test failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
      500
    );
  }
}
