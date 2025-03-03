-- 创建用户表，存储钱包地址和用户信息
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  nonce TEXT NOT NULL, -- 用于签名验证的随机数
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建会话表，存储用户会话信息
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建RLS策略
-- 用户表的RLS策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 允许已认证用户读取自己的信息
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- 允许已认证用户更新自己的信息
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 会话表的RLS策略
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 允许已认证用户读取自己的会话
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE id = sessions.user_id
    )
  );

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