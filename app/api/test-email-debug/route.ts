import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/apiUtils";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    console.log("Testing email service with debug info...");
    console.log(
      "RESEND_API_KEY:",
      process.env.RESEND_API_KEY ? "SET" : "NOT SET"
    );
    console.log("FROM_EMAIL:", process.env.FROM_EMAIL);

    if (!process.env.RESEND_API_KEY) {
      return createErrorResponse("RESEND_API_KEY not configured", 500);
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log("Resend client created, attempting to send email...");

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: ["yukiyukaiyue@gmail.com"], // Use your own email for testing
      subject: "Test Email - Raw School",
      html: "<p>This is a test email to verify the email service configuration.</p>",
    });

    console.log("Resend response:", { data, error });

    if (error) {
      console.error("Email service test failed", error);
      return createErrorResponse(
        `Email service test failed: ${JSON.stringify(error)}`,
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
    return createErrorResponse(
      `Email service test failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
      500
    );
  }
}
