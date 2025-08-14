// 用户类型定义
export interface User {
  id: string;

  // 邮箱认证字段
  email?: string;
  password_hash?: string;

  // 钱包认证字段
  wallet_address?: string;
  nonce?: string;

  // 用户信息字段
  username?: string;

  // 邮箱验证字段
  email_verified?: boolean;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: string;

  // 时间戳
  created_at: string;
  updated_at: string;
}

// 会话类型定义
export interface Session {
  id: string;
  user_id: string;
  token: string;
  auth_method: "email" | "wallet";
  expires_at: string;
  created_at: string;
}

// 认证方法类型
export type AuthMethod = "email" | "wallet";

// 传统认证请求类型
export interface EmailAuthRequest {
  email: string;
  password: string;
}

// 注册请求类型
export interface RegisterRequest {
  username?: string;
  wallet_address?: string;
  email?: string;
  password?: string;
}

// 钱包认证请求类型
export interface WalletAuthRequest {
  wallet_address: string;
}

// 认证挑战响应类型
export interface AuthChallengeResponse {
  nonce: string;
  message: string;
}

// 认证验证请求类型
export interface AuthVerifyRequest {
  wallet_address: string;
  signature: string;
}

// 认证验证响应类型
export interface AuthVerifyResponse {
  token: string;
  user: User;
  expires_at: string;
}

// 认证状态类型
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  expires_at: string | null;
  auth_method: AuthMethod | null;
}

// 认证错误类型
export interface AuthError {
  message: string;
  code: string;
}

// 密码重置请求类型
export interface PasswordResetRequest {
  email: string;
}

// 密码重置确认类型
export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

// 邮箱验证请求类型
export interface EmailVerificationRequest {
  token: string;
}
