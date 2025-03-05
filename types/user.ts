/**
 * 用户相关类型定义
 */

export interface UserProfile {
  id: string; // UUID
  wallet_address: string; // 钱包地址
  nonce: string; // 用于签名验证的随机数
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
  profile_name?: string; // 可选的用户名（旧字段，保留向后兼容）
  profile_image?: string; // 可选的头像URL
  username?: string; // 可选的用户名（新字段）
  bio?: string; // 用户简介
  social_links?: SocialLinks; // 社交媒体链接
}

export interface SocialLinks {
  twitter?: string;
  github?: string;
  website?: string;
  discord?: string;
  telegram?: string;
}

export interface UserSettings {
  user_id: string;
  theme_preference: "light" | "dark" | "system";
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
}

// 用户活动类型
export enum UserActivityType {
  LOGIN = "login",
  PROFILE_UPDATE = "profile_update",
  CONTENT_CREATION = "content_creation",
  CONTENT_INTERACTION = "content_interaction",
}

// 用户活动记录
export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: UserActivityType;
  metadata: Record<string, unknown>;
  created_at: string;
}
