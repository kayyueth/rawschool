"use server";

import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabaseClient";
import { logger } from "../logger";
import { User } from "@/types/auth";

/**
 * 生成随机nonce
 */
export async function generateNonce(): Promise<string> {
  return uuidv4();
}

/**
 * 根据钱包地址查找用户
 */
export async function findUserByWalletAddress(
  walletAddress: string
): Promise<User | null> {
  try {
    // 规范化钱包地址
    const normalizedAddress = walletAddress.toLowerCase();

    // 查询用户
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", normalizedAddress)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // PGRST116是"没有找到结果"的错误代码
        return null;
      }

      logger.error("查询用户失败", error);
      return null;
    }

    return data as User;
  } catch (error) {
    logger.error("查询用户失败", error);
    return null;
  }
}

/**
 * 根据用户ID查找用户
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.error("根据ID查询用户失败", error);
      return null;
    }

    return data as User;
  } catch (error) {
    logger.error("根据ID查询用户失败", error);
    return null;
  }
}

/**
 * 创建新用户
 */
export async function createUser(walletAddress: string): Promise<User | null> {
  try {
    // 规范化钱包地址
    const normalizedAddress = walletAddress.toLowerCase();

    // 生成随机nonce
    const nonce = await generateNonce();

    // 创建用户
    const { data, error } = await supabase
      .from("users")
      .insert([{ wallet_address: normalizedAddress, nonce }])
      .select()
      .single();

    if (error) {
      logger.error("创建用户失败", error);
      return null;
    }

    return data as User;
  } catch (error) {
    logger.error("创建用户失败", error);
    return null;
  }
}

/**
 * 更新用户的nonce
 */
export async function updateUserNonce(userId: string): Promise<User | null> {
  try {
    // 生成新的nonce
    const nonce = await generateNonce();

    // 更新用户
    const { data, error } = await supabase
      .from("users")
      .update({ nonce })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      logger.error("更新用户nonce失败", error);
      return null;
    }

    return data as User;
  } catch (error) {
    logger.error("更新用户nonce失败", error);
    return null;
  }
}

/**
 * 获取或创建用户
 */
export async function getOrCreateUser(
  walletAddress: string
): Promise<User | null> {
  try {
    // 查找现有用户
    const existingUser = await findUserByWalletAddress(walletAddress);

    // 如果用户存在，更新nonce
    if (existingUser) {
      return await updateUserNonce(existingUser.id);
    }

    // 创建新用户
    return await createUser(walletAddress);
  } catch (error) {
    logger.error("获取或创建用户失败", error);
    return null;
  }
}
