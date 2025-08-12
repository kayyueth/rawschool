import { NextResponse } from "next/server";
import { logger } from "../logger";

/**
 * 创建成功响应
 */
export function createSuccessResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * 创建错误响应
 */
export function createErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * 处理API错误
 */
export function handleApiError(
  error: unknown,
  errorMessage: string,
  logContext?: string
) {
  const err = error instanceof Error ? error : new Error(String(error));
  const context = logContext ? `[${logContext}]` : "";
  logger.error(`${context} ${errorMessage}: ${err.message}`, {
    stack: err.stack,
  });
  return createErrorResponse("Internal Server Error", 500);
}

/**
 * 安全执行API处理函数
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  errorMessage: string,
  logContext?: string
): Promise<T | NextResponse> {
  try {
    return await fn();
  } catch (error) {
    return handleApiError(error, errorMessage, logContext);
  }
}
