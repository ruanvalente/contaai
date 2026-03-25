-- =============================================
-- Migration: 007_add_profiles_insert_policy
-- Description: Add INSERT policy for profiles table and storage policies
-- Rollback: DROP POLICY IF EXISTS "Allow authenticated insert own profile" ON profiles; (storage policies cannot be rolled back easily)
-- =============================================

CREATE POLICY "Allow authenticated insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

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

-- Rollback: DROP POLICY IF EXISTS "Allow authenticated insert own profile" ON profiles;
