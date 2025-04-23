import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并Tailwind CSS类名
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 截断以太坊地址以便于显示
 * @param address 完整的以太坊地址
 * @param startChars 开头显示的字符数
 * @param endChars 结尾显示的字符数
 * @returns 截断后的地址字符串
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * 格式化日期时间
 * @param date 日期对象或时间戳
 * @param locale 地区设置
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(
  date: Date | number | string,
  locale: string = "zh-CN"
): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  return dateObj.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
