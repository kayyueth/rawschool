"use server";

import { Resend } from "resend";
import { logger } from "../logger";

// Initialize Resend client conditionally
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Email templates
const EMAIL_TEMPLATES = {
  verification: {
    subject: "Verify your email address - Raw School",
    html: (token: string, username?: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Raw School!</h2>
        <p>Hi ${username || "there"},</p>
        <p>Thank you for registering with Raw School. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            process.env.NEXT_PUBLIC_APP_URL
          }/verify-email?token=${token}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">
          ${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}
        </p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account with Raw School, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Raw School - Empowering Web3 Education
        </p>
      </div>
    `,
  },
  passwordReset: {
    subject: "Reset your password - Raw School",
    html: (token: string, username?: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${username || "there"},</p>
        <p>We received a request to reset your password for your Raw School account. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            process.env.NEXT_PUBLIC_APP_URL
          }/reset-password?token=${token}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">
          ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}
        </p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Raw School - Empowering Web3 Education
        </p>
      </div>
    `,
  },
  welcome: {
    subject: "Welcome to Raw School!",
    html: (username?: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Raw School!</h2>
        <p>Hi ${username || "there"},</p>
        <p>Welcome to Raw School! Your account has been successfully created and verified.</p>
        <p>You can now:</p>
        <ul>
          <li>Access all our Web3 educational content</li>
          <li>Participate in our community discussions</li>
          <li>Connect with other learners</li>
          <li>Track your learning progress</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Get Started
          </a>
        </div>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Raw School - Empowering Web3 Education
        </p>
      </div>
    `,
  },
};

/**
 * Send email verification
 */
export async function sendEmailVerification(
  email: string,
  token: string,
  username?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    const resendClient = getResendClient();
    if (!resendClient) {
      logger.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    const { data, error } = await resendClient.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: [email],
      subject: EMAIL_TEMPLATES.verification.subject,
      html: EMAIL_TEMPLATES.verification.html(token, username),
    });

    if (error) {
      logger.error("Failed to send verification email", error);
      return { success: false, error: "Failed to send verification email" };
    }

    logger.info("Verification email sent successfully", {
      email,
      messageId: data?.id,
    });
    return { success: true };
  } catch (error) {
    logger.error("Error sending verification email", error);
    return { success: false, error: "Failed to send verification email" };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  username?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    const resendClient = getResendClient();
    if (!resendClient) {
      logger.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    const { data, error } = await resendClient.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: [email],
      subject: EMAIL_TEMPLATES.passwordReset.subject,
      html: EMAIL_TEMPLATES.passwordReset.html(token, username),
    });

    if (error) {
      logger.error("Failed to send password reset email", error);
      return { success: false, error: "Failed to send password reset email" };
    }

    logger.info("Password reset email sent successfully", {
      email,
      messageId: data?.id,
    });
    return { success: true };
  } catch (error) {
    logger.error("Error sending password reset email", error);
    return { success: false, error: "Failed to send password reset email" };
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  username?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    const resendClient = getResendClient();
    if (!resendClient) {
      logger.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    const { data, error } = await resendClient.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: [email],
      subject: EMAIL_TEMPLATES.welcome.subject,
      html: EMAIL_TEMPLATES.welcome.html(username),
    });

    if (error) {
      logger.error("Failed to send welcome email", error);
      return { success: false, error: "Failed to send welcome email" };
    }

    logger.info("Welcome email sent successfully", {
      email,
      messageId: data?.id,
    });
    return { success: true };
  } catch (error) {
    logger.error("Error sending welcome email", error);
    return { success: false, error: "Failed to send welcome email" };
  }
}

/**
 * Test email service configuration
 */
export async function testEmailService(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const resendClient = getResendClient();
    if (!resendClient) {
      logger.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    const { data, error } = await resendClient.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: ["yukiyukaiyue@gmail.com"], // For testing, use your own email
      subject: "Test Email - Raw School",
      html: "<p>This is a test email to verify the email service configuration.</p>",
    });

    if (error) {
      logger.error("Email service test failed", error);
      return { success: false, error: "Email service test failed" };
    }

    logger.info("Email service test successful", { messageId: data?.id });
    return { success: true };
  } catch (error) {
    logger.error("Error testing email service", error);
    return { success: false, error: "Email service test failed" };
  }
}
