/**
 * 统一日志工具
 * 在生产环境中可以集成更复杂的日志系统
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const isProduction = process.env.NODE_ENV === "production";

function formatMessage(level: LogLevel, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${
    data ? JSON.stringify(data) : ""
  }`;
}

export const logger = {
  debug: (message: string, data?: any) => {
    if (!isProduction) {
      console.debug(formatMessage("debug", message, data));
    }
  },

  info: (message: string, data?: any) => {
    console.info(formatMessage("info", message, data));
  },

  warn: (message: string, data?: any) => {
    console.warn(formatMessage("warn", message, data));
  },

  error: (message: string, error?: any) => {
    console.error(
      formatMessage(
        "error",
        message,
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : error
      )
    );
  },
};
