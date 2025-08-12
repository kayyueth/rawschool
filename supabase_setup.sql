-- 创建users表 - 支持多种认证方式
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 传统认证字段
  email TEXT UNIQUE,
  password_hash TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token TEXT,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMP WITH TIME ZONE,
  
  -- 钱包认证字段
  wallet_address TEXT UNIQUE,
  nonce TEXT,
  
  -- 社交认证字段
  social_provider TEXT, -- 'google', 'github', 'discord', etc.
  social_id TEXT,
  social_email TEXT,
  
  -- 用户信息字段
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  
  -- 状态字段
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 约束：至少有一种认证方式
  CONSTRAINT at_least_one_auth_method CHECK (
    email IS NOT NULL OR wallet_address IS NOT NULL OR (social_provider IS NOT NULL AND social_id IS NOT NULL)
  )
);

-- 创建sessions表
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  auth_method TEXT NOT NULL, -- 'email', 'wallet', 'social'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 bookclub_reviews 表
CREATE TABLE IF NOT EXISTS public.bookclub_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  book_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 ambient_cards 表
CREATE TABLE IF NOT EXISTS public.ambient_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_social ON public.users(social_provider, social_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bookclub_reviews_user_id ON public.bookclub_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_bookclub_reviews_wallet_address ON public.bookclub_reviews(wallet_address);
CREATE INDEX IF NOT EXISTS idx_ambient_cards_user_id ON public.ambient_cards(user_id);

-- 创建函数和触发器来自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 启用RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- RLS策略
-- 用户表策略
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Allow public registration" ON public.users
  FOR INSERT WITH CHECK (true);

-- 会话表策略
CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT id::text FROM public.users WHERE id = sessions.user_id
    )
  );

CREATE POLICY "Allow session creation" ON public.sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own sessions" ON public.sessions
  FOR DELETE USING (
    auth.uid()::text IN (
      SELECT id::text FROM public.users WHERE id = sessions.user_id
    )
  ); 