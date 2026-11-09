/*
# Create profiles table for user data

1. Purpose
   This app has a sign-in / sign-up screen (login + register). Each registered
   user gets a row in `profiles` linked to their Supabase Auth account.
   The table stores the user's display name alongside their auth identity.

2. New Tables
   - `profiles`
     - `id` (uuid, primary key) — references `auth.users(id)`, cascading delete.
       This is the same id as the Supabase Auth user, so `auth.uid() = id`
       is the ownership check.
     - `email` (text, not null) — convenience copy of the auth email.
     - `full_name` (text, nullable) — optional display name collected at signup.
     - `created_at` (timestamptz, default now()) — when the profile was created.

3. Security
   - Enable RLS on `profiles`.
   - Grant SELECT, INSERT, UPDATE, DELETE to `authenticated` only (the app
     requires sign-in; there is no anon access to profile data).
   - Owner-scoped CRUD policies: each authenticated user can only read, insert,
     update, and delete their own profile row (where `auth.uid() = id`).
   - The INSERT policy uses `WITH CHECK (auth.uid() = id)` so a user can only
     create a profile for themselves.

4. Notes
   - Supabase Auth manages credentials in `auth.users`; `profiles` holds the
     extra app-level fields only. No passwords are stored in this table.
   - Email confirmation is OFF by default, so sign-up immediately creates a
     usable session.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
