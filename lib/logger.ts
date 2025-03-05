/**
 * 统一日志工具
 * 在生产环境中可以集成更复杂的日志系统
 */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogData = unknown;

const isProduction = process.env.NODE_ENV === "production";

/**
 * 将任何类型的数据转换为可记录的格式
 */
function formatData(data: LogData): string {
  if (data === null || data === undefined) {
    return "";
  }

  try {
    if (data instanceof Error) {
      return JSON.stringify({
        name: data.name,
        message: data.message,
        stack: data.stack,
      });
    }

    return JSON.stringify(data);
  } catch (err) {
    return `[无法序列化的数据: ${typeof data}]`;
  }
}

/**
 * 格式化日志消息
 */
function formatMessage(
  level: LogLevel,
  message: string,
  data?: LogData
): string {
  const timestamp = new Date().toISOString();
  const formattedData = data ? formatData(data) : "";

  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${formattedData}`.trim();
}

/**
 * 日志工具对象
 */
export const logger = {
  debug: (message: string, data?: LogData): void => {
    if (!isProduction) {
      console.debug(formatMessage("debug", message, data));
    }
  },

  info: (message: string, data?: LogData): void => {
    console.info(formatMessage("info", message, data));
  },

  warn: (message: string, data?: LogData): void => {
    console.warn(formatMessage("warn", message, data));
  },

  error: (message: string, error?: LogData): void => {
    console.error(formatMessage("error", message, error));
  },
};
