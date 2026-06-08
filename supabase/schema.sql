-- ================================================================
-- QuizForge — Schema completo
-- Ejecuta este SQL en Supabase Dashboard → SQL Editor → Run
-- ================================================================

-- 1. TABLA PROFILES (perfil extendido de cada usuario)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT        UNIQUE NOT NULL,
  full_name    TEXT        DEFAULT '',
  avatar_url   TEXT        DEFAULT '',
  plan         TEXT        NOT NULL DEFAULT 'free'
               CHECK (plan IN ('free','premium','premium_annual','teams','teams_annual')),
  is_admin     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLA UPLOADS (quizzes generados por cada usuario)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.uploads (
  id           UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject      TEXT        NOT NULL,
  type         TEXT        NOT NULL CHECK (type IN ('theory','practical')),
  emoji        TEXT        DEFAULT '',
  quiz_data    JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads  ENABLE ROW LEVEL SECURITY;

-- Profiles: cada usuario solo accede al suyo
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Uploads: cada usuario solo accede a los suyos
DROP POLICY IF EXISTS "uploads_select" ON public.uploads;
DROP POLICY IF EXISTS "uploads_insert" ON public.uploads;
DROP POLICY IF EXISTS "uploads_delete" ON public.uploads;

CREATE POLICY "uploads_select" ON public.uploads
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "uploads_insert" ON public.uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "uploads_delete" ON public.uploads
  FOR DELETE USING (auth.uid() = user_id);

-- 4. ÍNDICES
-- ================================================================
CREATE INDEX IF NOT EXISTS uploads_user_id_idx   ON public.uploads(user_id);
CREATE INDEX IF NOT EXISTS uploads_created_at_idx ON public.uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS profiles_email_idx     ON public.profiles(email);

-- 5. TRIGGER: crear perfil automáticamente al registrarse
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, is_admin, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    -- La cuenta admin es gratuita sin límites
    CASE WHEN NEW.email = 'familycabanellascapo@gmail.com' THEN TRUE  ELSE FALSE END,
    CASE WHEN NEW.email = 'familycabanellascapo@gmail.com' THEN 'premium' ELSE 'free' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. TRIGGER: actualizar updated_at automáticamente
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. COLUMNAS STRIPE (migración — ejecutar si ya tenías la tabla)
-- ================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subscription_ends_at   TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_status          TEXT    DEFAULT NULL;

CREATE INDEX IF NOT EXISTS profiles_stripe_customer_idx ON public.profiles(stripe_customer_id);

-- 8. CUENTA ADMIN (por si el usuario ya existe en auth.users)
-- ================================================================
INSERT INTO public.profiles (id, email, is_admin, plan)
SELECT id, email, TRUE, 'premium'
FROM   auth.users
WHERE  email = 'familycabanellascapo@gmail.com'
ON CONFLICT (id) DO UPDATE
  SET is_admin   = TRUE,
      plan       = 'premium',
      updated_at = NOW();
