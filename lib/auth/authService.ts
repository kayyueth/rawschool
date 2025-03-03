"use server";

import { ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabaseClient";
import { logger } from "../logger";
import { User, Session } from "@/types/auth";
import { setCookie, deleteCookie, getCookie } from "./cookieUtils";
import { getOrCreateUser as getUserFromService } from "./userService";

// 创建签名消息
export function createSignMessage(address: string, nonce: string): string {
  return `请签名此消息以验证您是钱包地址 ${address} 的所有者。\n\n随机码: ${nonce}\n\n此签名不会花费任何gas费用。`;
}

// 验证签名
export function verifySignature(
  message: string,
  signature: string,
  address: string
): boolean {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    logger.error("签名验证失败", error);
    return false;
  }
}

// 获取或创建用户 - 使用userService中的实现
export async function getOrCreateUser(
  walletAddress: string
): Promise<User | null> {
  return getUserFromService(walletAddress);
}

// 创建会话
export async function createSession(userId: string): Promise<Session | null> {
  try {
    // 生成会话令牌
    const token = uuidv4();

    // 设置过期时间（7天后）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 创建会话记录
    const { data: session, error } = await supabase
      .from("sessions")
      .insert([
        {
          user_id: userId,
          token,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error("创建会话失败", error);
      return null;
    }

    // 设置会话cookie
    await setCookie("auth_token", token, {
      expires: expiresAt,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return session as Session;
  } catch (error) {
    logger.error("创建会话失败", error);
    return null;
  }
}

// 验证会话
export async function validateSession(token: string): Promise<User | null> {
  try {
    // 查找会话
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("token", token)
      .single();

    if (sessionError || !session) {
      return null;
    }

    // 检查会话是否过期
    if (new Date(session.expires_at) < new Date()) {
      // 删除过期会话
      await supabase.from("sessions").delete().eq("id", session.id);
      return null;
    }

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user_id)
      .single();

    if (userError || !user) {
      return null;
    }

    return user as User;
  } catch (error) {
    logger.error("验证会话失败", error);
    return null;
  }
}

// 删除会话（登出）
export async function deleteSession(token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("token", token);

    if (error) {
      logger.error("删除会话失败", error);
      return false;
    }

    // 清除cookie
    await deleteCookie("auth_token");

    return true;
  } catch (error) {
    logger.error("删除会话失败", error);
    return false;
  }
}

// 获取当前用户
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = await getCookie("auth_token");

    if (!token) {
      return null;
    }

    return await validateSession(token);
  } catch (error) {
    logger.error("获取当前用户失败", error);
    return null;
  }
}
