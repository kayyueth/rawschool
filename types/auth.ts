// 用户类型定义
export interface User {
  id: string;
  wallet_address: string;
  nonce: string;
  created_at: string;
  updated_at: string;
  username?: string;
}

// 会话类型定义
export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

// 认证请求类型
export interface AuthRequest {
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
}

// 认证错误类型
export interface AuthError {
  message: string;
  code: string;
}
