import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/apiUtils";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: ["test@example.com"],
      subject: "Test Email - Raw School",
      html: "<p>This is a test email to verify the email service configuration.</p>",
    });

    if (error) {
      console.error("Email service test failed", error);
      return createErrorResponse(
        `Email service test failed: ${error.message}`,
        500
      );
    }

    console.log("Email service test successful", { messageId: data?.id });
    return createSuccessResponse({
      message: "Email sent successfully",
      messageId: data?.id,
    });
  } catch (error) {
    console.error("Error testing email service", error);
    return createErrorResponse("Email service test failed", 500);
  }
}
