-- =============================================
-- Migration: 008_add_bio_column
-- Description: Add bio column to profiles table
-- Rollback: ALTER TABLE profiles DROP COLUMN IF EXISTS bio;
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Rollback: ALTER TABLE profiles DROP COLUMN IF EXISTS bio;
