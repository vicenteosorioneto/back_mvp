-- ============================================================
-- FIX: Auto-criar user_profiles para cada novo auth.user
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. Função que cria o perfil automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'produtor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger: dispara após todo INSERT em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Corrigir usuários já existentes que não têm linha em user_profiles
INSERT INTO public.user_profiles (id, name, email, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', au.email) AS name,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'produtor') AS role
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;
