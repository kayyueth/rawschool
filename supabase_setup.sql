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
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bookclub_reviews_user_id ON public.bookclub_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_bookclub_reviews_wallet_address ON public.bookclub_reviews(wallet_address);
CREATE INDEX IF NOT EXISTS idx_ambient_cards_user_id ON public.ambient_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_ambient_cards_wallet_address ON public.ambient_cards(wallet_address);

-- 启用RLS（行级安全）
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookclub_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambient_cards ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "允许匿名读取用户" ON public.users FOR SELECT USING (true);
CREATE POLICY "允许匿名插入用户" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "允许匿名更新用户" ON public.users FOR UPDATE USING (true);

CREATE POLICY "允许匿名读取会话" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "允许匿名插入会话" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "允许匿名删除会话" ON public.sessions FOR DELETE USING (true);

CREATE POLICY "允许匿名读取书评" ON public.bookclub_reviews FOR SELECT USING (true);
CREATE POLICY "允许匿名插入书评" ON public.bookclub_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "允许匿名更新书评" ON public.bookclub_reviews FOR UPDATE USING (true);
CREATE POLICY "允许匿名删除书评" ON public.bookclub_reviews FOR DELETE USING (true);

CREATE POLICY "允许匿名读取卡片" ON public.ambient_cards FOR SELECT USING (true);
CREATE POLICY "允许匿名插入卡片" ON public.ambient_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "允许匿名更新卡片" ON public.ambient_cards FOR UPDATE USING (true);
CREATE POLICY "允许匿名删除卡片" ON public.ambient_cards FOR DELETE USING (true);

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

-- 为bookclub_reviews表添加触发器
CREATE TRIGGER update_bookclub_reviews_updated_at
BEFORE UPDATE ON public.bookclub_reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 为ambient_cards表添加触发器
CREATE TRIGGER update_ambient_cards_updated_at
BEFORE UPDATE ON public.ambient_cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 