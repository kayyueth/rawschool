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
  WalletAuthRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerificationRequest,
} from "@/types/auth";
import { setCookie, deleteCookie, getCookie } from "./cookieUtils";
import { getOrCreateUser as getUserFromService } from "./userService";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../services/emailService";

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

// 钱包认证 - 注册
export async function registerUser(
  data: RegisterRequest
): Promise<{ user: User | null; error: string | null }> {
  try {
    // 检查钱包地址是否已存在
    if (data.wallet_address) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", data.wallet_address)
        .single();

      if (existingUser) {
        return { user: null, error: "Wallet address already registered" };
      }
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

    // 生成nonce
    const nonce = uuidv4();

    // 创建用户
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          wallet_address: data.wallet_address,
          username: data.username,
          nonce: nonce,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error("注册用户失败", error);
      return { user: null, error: "Failed to create user" };
    }

    return { user: user as User, error: null };
  } catch (error) {
    logger.error("注册用户失败", error);
    return { user: null, error: "Registration failed" };
  }
}

// 邮箱认证 - 注册
export async function registerUserWithEmail(data: {
  email: string;
  password: string;
  username: string;
}): Promise<{ user: User | null; error: string | null }> {
  try {
    console.log("registerUserWithEmail called with:", {
      email: data.email,
      username: data.username,
    });

    // 检查邮箱是否已存在
    const { data: existingUser, error: emailCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("email", data.email)
      .single();

    if (existingUser) {
      console.log("Email already exists:", data.email);
      return { user: null, error: "Email already registered" };
    }

    if (emailCheckError && emailCheckError.code !== "PGRST116") {
      console.log("Email check error:", emailCheckError);
      logger.error("Email check error:", emailCheckError);
    }

    // 检查用户名是否已存在
    const { data: existingUsername, error: usernameCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("username", data.username)
      .single();

    if (existingUsername) {
      console.log("Username already exists:", data.username);
      return { user: null, error: "Username already taken" };
    }

    if (usernameCheckError && usernameCheckError.code !== "PGRST116") {
      console.log("Username check error:", usernameCheckError);
      logger.error("Username check error:", usernameCheckError);
    }

    // 加密密码
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // 生成邮箱验证令牌
    const emailVerificationToken = uuidv4();

    // 创建用户
    console.log("Attempting to create user in database");
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          email: data.email,
          password_hash: passwordHash,
          username: data.username,
          email_verification_token: emailVerificationToken,
          email_verified: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log("Database insert error:", error);
      logger.error("注册用户失败", error);
      return { user: null, error: "Failed to create user" };
    }

    // 发送验证邮件
    try {
      await sendEmailVerification(data.email, emailVerificationToken);
    } catch (emailError) {
      logger.error("发送验证邮件失败", emailError);
      // 不阻止注册，但记录错误
    }

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
    // After successful verification, send welcome email
    const { data: userData } = await supabase
      .from("users")
      .select("email, username")
      .eq("id", user.id)
      .single();

    if (userData?.email) {
      const welcomeResult = await sendWelcomeEmail(
        userData.email,
        userData.username
      );
      if (!welcomeResult.success) {
        logger.warn("Failed to send welcome email", {
          email: userData.email,
          error: welcomeResult.error,
        });
      }
    }
    await supabase
      .from("users")
      .update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires.toISOString(),
      })
      .eq("id", user.id);

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken);
    if (!emailResult.success) {
      logger.error("Failed to send password reset email", emailResult.error);
      // Don't fail the request if email fails, but log it
    }

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
    // After successful verification, send welcome email
    const { data: userData } = await supabase
      .from("users")
      .select("email, username")
      .eq("id", user.id)
      .single();

    if (userData?.email) {
      const welcomeResult = await sendWelcomeEmail(
        userData.email,
        userData.username
      );
      if (!welcomeResult.success) {
        logger.warn("Failed to send welcome email", {
          email: userData.email,
          error: welcomeResult.error,
        });
      }
    }
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
