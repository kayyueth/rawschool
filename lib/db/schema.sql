-- 创建users表 - 支持邮箱和钱包认证
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- 邮箱认证字段
  email TEXT UNIQUE,
  password_hash TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token TEXT,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMP WITH TIME ZONE,
  
  -- 钱包认证字段
  wallet_address TEXT UNIQUE,
  nonce TEXT,
  
  -- 用户信息字段
  username TEXT UNIQUE,
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
    email IS NOT NULL OR wallet_address IS NOT NULL
  )
);

-- 创建sessions表，存储用户会话信息
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  auth_method TEXT NOT NULL, -- 'email', 'wallet'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建 bookclub_reviews 表
CREATE TABLE IF NOT EXISTS bookclub_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  book_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 ambient_cards 表
CREATE TABLE IF NOT EXISTS ambient_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bookclub_reviews_user_id ON bookclub_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_bookclub_reviews_wallet_address ON bookclub_reviews(wallet_address);
CREATE INDEX IF NOT EXISTS idx_ambient_cards_user_id ON ambient_cards(user_id);

-- 创建函数和触发器来自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS策略
-- 用户表策略
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Allow public registration" ON users
  FOR INSERT WITH CHECK (true);

-- 会话表策略
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT id::text FROM users WHERE id = sessions.user_id
    )
  );

CREATE POLICY "Allow session creation" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE USING (
    auth.uid()::text IN (
      SELECT id::text FROM users WHERE id = sessions.user_id
    )
  ); 