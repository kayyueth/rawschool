"use server";

import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "./authService";
import { getCookie } from "./cookieUtils";
import { logger } from "../logger";

/**
 * 检查用户是否已认证
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getCookie("auth_token");

  if (!token) {
    return false;
  }

  const user = await validateSession(token);
  return !!user;
}

/**
 * 简单的认证中间件 - 用于路由处理程序
 * 如果未认证，重定向到首页
 */
export async function authMiddleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token");

  // 如果没有认证令牌，重定向到登录页面
  if (!authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 验证会话
  const user = await validateSession(authToken.value);

  // 如果会话无效，重定向到登录页面
  if (!user) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("auth_token");
    return response;
  }

  // 用户已认证，继续处理请求
  return NextResponse.next();
}

/**
 * 高级认证中间件 - 用于API处理程序
 * 提供用户ID和钱包地址给处理程序
 */
export async function apiAuthMiddleware(
  request: NextRequest,
  handler: (
    req: NextRequest,
    userId: string,
    walletAddress: string
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // 获取认证令牌
    const authToken = request.cookies.get("auth_token");

    // 如果没有认证令牌，返回未授权错误
    if (!authToken) {
      return NextResponse.json(
        { error: "未认证，请先连接并认证钱包" },
        { status: 401 }
      );
    }

    // 验证会话
    const user = await validateSession(authToken.value);

    // 如果会话无效，返回未授权错误
    if (!user) {
      const response = NextResponse.json(
        { error: "会话已过期，请重新认证" },
        { status: 401 }
      );
      response.cookies.delete("auth_token");
      return response;
    }

    // 调用处理程序，传递用户信息
    return await handler(request, user.id, user.wallet_address);
  } catch (error) {
    logger.error("API认证中间件错误", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

/**
 * 检查是否为内容所有者
 */
export async function isContentOwner(
  contentCreatorAddress: string
): Promise<boolean> {
  const token = await getCookie("auth_token");

  if (!token) {
    return false;
  }

  const user = await validateSession(token);

  if (!user) {
    return false;
  }

  return checkAddressOwnership(contentCreatorAddress, user.wallet_address);
}

/**
 * 检查地址所有权
 * 比较两个地址是否匹配（不区分大小写）
 */
export function checkAddressOwnership(
  requestAddress: string,
  authenticatedAddress: string
): boolean {
  return requestAddress.toLowerCase() === authenticatedAddress.toLowerCase();
}

/**
 * 获取当前用户信息
 * 注意：此函数仅在客户端组件中使用，服务器端应使用getCurrentUser
 */
export function getCurrentUserInfo(): {
  userId: string | null;
  walletAddress: string | null;
} {
  // 这是一个客户端函数，应该从localStorage或状态管理中获取
  // 在实际实现中，这应该与Web3Context集成
  return {
    userId: null,
    walletAddress: null,
  };
}
