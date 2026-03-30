-- Migration: 014_add_profiles_insert_policy
-- Phase: 1 - Security (Critical)
-- Description: Add INSERT policy for profiles table and improve trigger

-- Policy: Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Update trigger to use ON CONFLICT to prevent errors on duplicate inserts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rollback:
-- DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, name, avatar_url)
--   VALUES (
--     NEW.id,
--     NEW.raw_user_meta_data->>'name',
--     NEW.raw_user_meta_data->>'avatar_url'
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
