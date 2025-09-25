import { NextRequest } from "next/server";
import { submitApplication } from "@/lib/services/applicationService";
import {
  createSuccessResponse,
  createErrorResponse,
  safeExecute,
} from "@/lib/api/apiUtils";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  return safeExecute(
    async () => {
      const body = await request.json();
      const { name, email, bookName, expectedReadWeeks, recommendation } = body;

      // Validate required fields
      if (
        !name ||
        !email ||
        !bookName ||
        !expectedReadWeeks ||
        !recommendation
      ) {
        return createErrorResponse("All fields are required", 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return createErrorResponse("Invalid email format", 400);
      }

      // Validate expected read weeks
      const weeks = parseInt(expectedReadWeeks);
      if (isNaN(weeks) || weeks <= 0 || weeks > 52) {
        return createErrorResponse(
          "Expected read weeks must be between 1 and 52",
          400
        );
      }

      const application = {
        name,
        email,
        book_name: bookName,
        expected_read_weeks: weeks,
        recommendation,
      };

      const {
        success,
        error,
        application: savedApplication,
      } = await submitApplication(application);

      if (!success) {
        logger.error("Failed to submit application", { error });
        return createErrorResponse(
          error || "Failed to submit application",
          500
        );
      }

      logger.info("Application submitted successfully", {
        id: savedApplication?.id,
      });
      return createSuccessResponse({
        message: "Application submitted successfully",
        application: savedApplication,
      });
    },
    "Application submission failed",
    "Submit application"
  );
}
