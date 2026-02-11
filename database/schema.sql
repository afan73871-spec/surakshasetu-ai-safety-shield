
-- Master Schema for Suraksha Setu
-- Use this file to rebuild the entire database structure

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  security_level TEXT DEFAULT 'Standard',
  is_pro BOOLEAN DEFAULT false,
  plan_selected BOOLEAN DEFAULT false,
  plan_type TEXT DEFAULT 'BASIC',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_location TEXT DEFAULT 'Hub Active',
  safety_status TEXT DEFAULT 'SECURE',
  battery_level INTEGER DEFAULT 100,
  lat NUMERIC,
  lng NUMERIC
);

CREATE TABLE IF NOT EXISTS public.family_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_email TEXT NOT NULL,
  target_email TEXT NOT NULL,
  relation_type TEXT,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guardian_email, target_email)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT,
  user_email TEXT,
  plan_id TEXT,
  plan_name TEXT,
  amount NUMERIC,
  currency TEXT,
  razorpay_payment_id TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scam_reports (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  identifier TEXT NOT NULL,
  description TEXT,
  city TEXT DEFAULT 'Global',
  reports_count INTEGER DEFAULT 1,
  risk_score INTEGER DEFAULT 75,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_name TEXT,
  subject TEXT,
  message TEXT,
  token_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'PENDING', -- PENDING, RESOLVED
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Access Profiles" ON public.profiles FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Links" ON public.family_links FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Orders" ON public.orders FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Scams" ON public.scam_reports FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Support" ON public.support_requests FOR ALL TO public USING (true) WITH CHECK (true);

-- Refresh Cache
NOTIFY pgrst, 'reload schema';
