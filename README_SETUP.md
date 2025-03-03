# Web3 钱包连接和权限管理系统设置指南

## 数据库设置

在使用 Web3 钱包连接和权限管理系统之前，您需要在 Supabase 中设置必要的数据库表。

### 步骤 1：登录 Supabase 控制台

1. 访问 [Supabase 控制台](https://app.supabase.io/)
2. 登录您的账户
3. 选择您的项目

### 步骤 2：执行 SQL 脚本

1. 在 Supabase 控制台中，点击左侧菜单中的 "SQL Editor"
2. 点击 "New Query"
3. 复制并粘贴以下 SQL 脚本：

```sql
-- 创建users表
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE,
  nonce TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建sessions表
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);

-- 启用RLS（行级安全）
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "允许匿名读取用户" ON public.users FOR SELECT USING (true);
CREATE POLICY "允许匿名插入用户" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "允许匿名更新用户" ON public.users FOR UPDATE USING (true);

CREATE POLICY "允许匿名读取会话" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "允许匿名插入会话" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "允许匿名删除会话" ON public.sessions FOR DELETE USING (true);

-- 创建触发器函数来自动更新updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为users表添加触发器
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

4. 点击 "Run" 按钮执行 SQL 脚本

### 步骤 3：验证表是否创建成功

1. 在 Supabase 控制台中，点击左侧菜单中的 "Table Editor"
2. 您应该能看到新创建的 `users` 和 `sessions` 表

## 环境变量设置

确保您的 `.env.local` 文件中包含以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 启动应用

设置完成后，您可以启动应用：

```bash
npm run dev
```

现在，您的 Web3 钱包连接和权限管理系统应该可以正常工作了。
