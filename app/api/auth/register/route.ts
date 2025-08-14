import { NextRequest } from "next/server";
import { registerUser, registerUserWithEmail } from "@/lib/auth/authService";
import {
  createSuccessResponse,
  createErrorResponse,
  safeExecute,
} from "@/lib/api/apiUtils";
import { RegisterRequest } from "@/types/auth";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  return safeExecute(
    async () => {
      const body: RegisterRequest = await request.json();
      console.log("Registration request body:", body);
      logger.info("Registration request body:", body);

      const { username, wallet_address, email, password } = body;

      // Check if this is email-based registration
      if (email && password) {
        console.log("Processing email registration");
        logger.info("Processing email registration");

        // Email-based registration
        if (!email || !password || !username) {
          console.log("Missing required fields:", {
            email: !!email,
            password: !!password,
            username: !!username,
          });
          return createErrorResponse(
            "Email, password, and username are required for email registration",
            400
          );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return createErrorResponse("Invalid email format", 400);
        }

        // Register user with email
        console.log("Calling registerUserWithEmail");
        const { user, error } = await registerUserWithEmail({
          email,
          password,
          username,
        });

        if (error) {
          console.log("Registration error:", error);
          return createErrorResponse(error, 400);
        }

        if (!user) {
          return createErrorResponse("Failed to create user", 500);
        }

        return createSuccessResponse({
          message:
            "User registered successfully. Please check your email for verification.",
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
          },
        });
      }

      // Wallet-based registration (existing logic)
      if (!wallet_address) {
        return createErrorResponse(
          "Wallet address is required for wallet registration",
          400
        );
      }

      // Validate wallet address format
      const walletRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!walletRegex.test(wallet_address)) {
        return createErrorResponse("Invalid wallet address format", 400);
      }

      // Register user with wallet
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
