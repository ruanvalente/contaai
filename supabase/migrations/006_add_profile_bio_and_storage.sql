-- =============================================
-- Migration: 006_add_profile_bio_and_storage
-- Description: Add bio field and avatar storage bucket
-- =============================================

-- 1. Adicionar campo bio à tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Criar trigger para auto-update do updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Criar bucket de avatares (contaai)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contaai', 
  'contaai', 
  true, 
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Policies de Storage
DROP POLICY IF EXISTS "Public read contaai" ON storage.objects;
CREATE POLICY "Public read contaai" ON storage.objects
  FOR SELECT USING (bucket_id = 'contaai');

DROP POLICY IF EXISTS "Authenticated users can upload to contaai" ON storage.objects;
CREATE POLICY "Authenticated users can upload to contaai" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contaai' 
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

DROP POLICY IF EXISTS "Users can manage own files in contaai" ON storage.objects;
CREATE POLICY "Users can manage own files in contaai" ON storage.objects
  FOR ALL USING (
    bucket_id = 'contaai' 
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );
