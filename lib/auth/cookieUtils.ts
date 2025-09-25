"use server";

import { cookies } from "next/headers";

/**
 * 获取cookie值
 */
export async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

/**
 * 设置cookie
 */
export async function setCookie(
  name: string,
  value: string,
  options?: {
    expires?: Date;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  }
) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, options);
}

/**
 * 删除cookie
 */
export async function deleteCookie(name: string) {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}

/**
 * 获取认证令牌
 */
export async function getAuthToken(): Promise<string | undefined> {
  return getCookie("auth_token");
}
