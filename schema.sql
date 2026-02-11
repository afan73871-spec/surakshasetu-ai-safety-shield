-- 1. REPAIR PROFILES TABLE (Force-add columns if they were missed)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_location') THEN
        ALTER TABLE public.profiles ADD COLUMN last_location TEXT DEFAULT 'Hub Active';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='safety_status') THEN
        ALTER TABLE public.profiles ADD COLUMN safety_status TEXT DEFAULT 'SECURE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='battery_level') THEN
        ALTER TABLE public.profiles ADD COLUMN battery_level INTEGER DEFAULT 100;
    END IF;
END $$;

-- 2. ENSURE ALL TABLES EXIST (Keeping all feature structures)
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
  battery_level INTEGER DEFAULT 100
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

-- 3. RESET RLS & POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Profiles Access" ON public.profiles;
DROP POLICY IF EXISTS "Public Family Links" ON public.family_links;
DROP POLICY IF EXISTS "Public Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Scam Reports" ON public.scam_reports;

CREATE POLICY "Public Profiles Access" ON public.profiles FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Family Links" ON public.family_links FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Orders" ON public.orders FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Scam Reports" ON public.scam_reports FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. THE MAGIC FIX: REFRESH THE API CACHE
NOTIFY pgrst, 'reload schema';