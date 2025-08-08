import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  createSuccessResponse,
  createErrorResponse,
  safeExecute,
} from "@/lib/api/apiUtils";

export async function GET() {
  return safeExecute(
    async () => {
      const nonce = uuidv4();
      return createSuccessResponse({ nonce });
    },
    "生成nonce失败",
    "生成nonce"
  );
}
