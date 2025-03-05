/**
 * 用户相关类型定义
 */

export interface User {
  id: string; // UUID
  wallet_address: string; // 钱包地址
  nonce: string; // 用于签名验证的随机数
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
  profile_name?: string; // 可选的用户名（旧字段，保留向后兼容）
  profile_image?: string; // 可选的头像URL
  username?: string; // 可选的用户名（新字段）
}

export interface Session {
  token: string; // JWT令牌
  user: User; // 用户信息
  expires_at: number; // 过期时间戳（毫秒）
}

export interface AuthRequest {
  wallet_address: string; // 请求身份验证的钱包地址
}

export interface AuthChallenge {
  wallet_address: string; // 钱包地址
  nonce: string; // 随机数（用于签名）
  expiration: number; // 挑战过期时间戳（毫秒）
}

export interface AuthVerify {
  wallet_address: string; // 钱包地址
  signature: string; // 签名
}

export interface AuthResponse {
  success: boolean; // 认证是否成功
  message?: string; // 错误信息（如果有）
  session?: Session; // 会话信息（如果认证成功）
}
