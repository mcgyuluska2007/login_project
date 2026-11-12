/*
# Create profiles automatically for new Auth users

1. Purpose
   New accounts are created in Supabase Auth first. This migration makes the
   matching public profile row automatic, so registration does not depend on a
   browser request succeeding after signup or on whether email confirmation is
   enabled.

2. Modified Tables
   - `profiles` — existing table remains the user-owned profile store.
   - `auth.users` — no columns are changed; a trigger is added to its insert
     event.

3. New Database Objects
   - `public.handle_new_user()` — SECURITY DEFINER trigger function that copies
     the Auth user's id, email, and `raw_user_meta_data.full_name` into
     `public.profiles`.
   - `on_auth_user_created` — trigger on `auth.users` that calls the function
     after each new Auth user is inserted.

4. Security
   - The function uses a fixed `search_path` of `public` and only inserts the
     authenticated user's own signup data supplied by Supabase Auth.
   - Execute permission is removed from PUBLIC, anon, and authenticated. The
     function is callable only by the database trigger system.
   - Anonymous access to `profiles` is removed. Authenticated users retain
     owner-scoped CRUD through the existing RLS policies.

5. Important Notes
   - Passwords are never copied to `profiles` and remain managed by Supabase
     Auth.
   - `ON CONFLICT` keeps the trigger safe if a profile row already exists.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'full_name'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.profiles FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
