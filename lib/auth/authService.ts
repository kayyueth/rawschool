"use server";

import { ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { supabase } from "../supabaseClient";
import { logger } from "../logger";
import {
  User,
  Session,
  AuthMethod,
  EmailAuthRequest,
  RegisterRequest,
  SocialAuthRequest,
  WalletAuthRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerificationRequest,
} from "@/types/auth";
import { setCookie, deleteCookie, getCookie } from "./cookieUtils";
import { getOrCreateUser as getUserFromService } from "./userService";

// 创建签名消息
export async function createSignMessage(
  address: string,
  nonce: string
): Promise<string> {
  return `Please sign this message to verify you are the owner of wallet address ${address}.\n\nNonce: ${nonce}\n\nThis signature will not cost any gas fees.`;
}

// 验证签名
export async function verifySignature(
  message: string,
  signature: string,
  address: string
): Promise<boolean> {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    logger.error("签名验证失败", error);
    return false;
  }
}

// 创建会话
export async function createSession(
  userId: string,
  authMethod: AuthMethod
): Promise<Session | null> {
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
          auth_method: authMethod,
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

// 传统认证 - 注册
export async function registerUser(
  data: RegisterRequest
): Promise<{ user: User | null; error: string | null }> {
  try {
    // 检查邮箱是否已存在
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", data.email)
      .single();

    if (existingUser) {
      return { user: null, error: "Email already registered" };
    }

    // 检查用户名是否已存在
    if (data.username) {
      const { data: existingUsername } = await supabase
        .from("users")
        .select("id")
        .eq("username", data.username)
        .single();

      if (existingUsername) {
        return { user: null, error: "Username already taken" };
      }
    }

    // 加密密码
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // 生成邮箱验证令牌
    const emailVerificationToken = uuidv4();

    // 创建用户
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          email: data.email,
          password_hash: passwordHash,
          username: data.username,
          display_name: data.display_name,
          email_verification_token: emailVerificationToken,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error("注册用户失败", error);
      return { user: null, error: "Failed to create user" };
    }

    // TODO: 发送邮箱验证邮件
    // await sendEmailVerification(data.email, emailVerificationToken);

    return { user: user as User, error: null };
  } catch (error) {
    logger.error("注册用户失败", error);
    return { user: null, error: "Registration failed" };
  }
}

// 传统认证 - 登录
export async function loginWithEmail(data: EmailAuthRequest): Promise<{
  user: User | null;
  session: Session | null;
  error: string | null;
}> {
  try {
    // 查找用户
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", data.email)
      .single();

    if (error || !user) {
      return { user: null, session: null, error: "Invalid email or password" };
    }

    // 验证密码
    if (!user.password_hash) {
      return { user: null, session: null, error: "Invalid email or password" };
    }

    const isValidPassword = await bcrypt.compare(
      data.password,
      user.password_hash
    );
    if (!isValidPassword) {
      return { user: null, session: null, error: "Invalid email or password" };
    }

    // 检查用户是否激活
    if (!user.is_active) {
      return { user: null, session: null, error: "Account is deactivated" };
    }

    // 更新最后登录时间
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);

    // 创建会话
    const session = await createSession(user.id, "email");
    if (!session) {
      return { user: null, session: null, error: "Failed to create session" };
    }

    return { user: user as User, session, error: null };
  } catch (error) {
    logger.error("邮箱登录失败", error);
    return { user: null, session: null, error: "Login failed" };
  }
}

// 社交认证
export async function loginWithSocial(data: SocialAuthRequest): Promise<{
  user: User | null;
  session: Session | null;
  error: string | null;
}> {
  try {
    // 查找现有用户
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("social_provider", data.provider)
      .eq("social_id", data.user_data?.id)
      .single();

    let user: User;

    if (existingUser) {
      // 用户存在，更新信息
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          social_email: data.user_data?.email,
          display_name: data.user_data?.name,
          avatar_url: data.user_data?.avatar_url,
          last_login_at: new Date().toISOString(),
        })
        .eq("id", existingUser.id)
        .select()
        .single();

      if (updateError) {
        logger.error("更新社交用户失败", updateError);
        return { user: null, session: null, error: "Failed to update user" };
      }

      user = updatedUser as User;
    } else {
      // 创建新用户
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            social_provider: data.provider,
            social_id: data.user_data?.id,
            social_email: data.user_data?.email,
            display_name: data.user_data?.name,
            avatar_url: data.user_data?.avatar_url,
            email_verified: true, // 社交登录默认已验证邮箱
          },
        ])
        .select()
        .single();

      if (createError) {
        logger.error("创建社交用户失败", createError);
        return { user: null, session: null, error: "Failed to create user" };
      }

      user = newUser as User;
    }

    // 创建会话
    const session = await createSession(user.id, "social");
    if (!session) {
      return { user: null, session: null, error: "Failed to create session" };
    }

    return { user, session, error: null };
  } catch (error) {
    logger.error("社交登录失败", error);
    return { user: null, session: null, error: "Social login failed" };
  }
}

// 钱包认证
export async function loginWithWallet(data: WalletAuthRequest): Promise<{
  user: User | null;
  session: Session | null;
  error: string | null;
}> {
  try {
    // 获取或创建用户
    const user = await getUserFromService(data.wallet_address);
    if (!user) {
      return {
        user: null,
        session: null,
        error: "Failed to get or create user",
      };
    }

    // 创建会话
    const session = await createSession(user.id, "wallet");
    if (!session) {
      return { user: null, session: null, error: "Failed to create session" };
    }

    return { user, session, error: null };
  } catch (error) {
    logger.error("钱包登录失败", error);
    return { user: null, session: null, error: "Wallet login failed" };
  }
}

// 密码重置请求
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // 查找用户
    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error || !user) {
      // 不暴露用户是否存在的信息
      return { success: true, error: null };
    }

    // 生成重置令牌
    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1小时过期

    // 更新用户
    await supabase
      .from("users")
      .update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires.toISOString(),
      })
      .eq("id", user.id);

    // TODO: 发送密码重置邮件
    // await sendPasswordResetEmail(email, resetToken);

    return { success: true, error: null };
  } catch (error) {
    logger.error("密码重置请求失败", error);
    return { success: false, error: "Failed to process reset request" };
  }
}

// 密码重置确认
export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // 查找用户
    const { data: user, error } = await supabase
      .from("users")
      .select("id, password_reset_expires")
      .eq("password_reset_token", token)
      .single();

    if (error || !user) {
      return { success: false, error: "Invalid reset token" };
    }

    // 检查令牌是否过期
    if (new Date(user.password_reset_expires) < new Date()) {
      return { success: false, error: "Reset token expired" };
    }

    // 加密新密码
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码并清除重置令牌
    await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires: null,
      })
      .eq("id", user.id);

    return { success: true, error: null };
  } catch (error) {
    logger.error("密码重置确认失败", error);
    return { success: false, error: "Failed to reset password" };
  }
}

// 邮箱验证
export async function verifyEmail(
  token: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // 查找用户
    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email_verification_token", token)
      .single();

    if (error || !user) {
      return { success: false, error: "Invalid verification token" };
    }

    // 更新用户
    await supabase
      .from("users")
      .update({
        email_verified: true,
        email_verification_token: null,
      })
      .eq("id", user.id);

    return { success: true, error: null };
  } catch (error) {
    logger.error("邮箱验证失败", error);
    return { success: false, error: "Failed to verify email" };
  }
}
