-- Fix RLS policies for google_auth table to allow service role access
-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own google_auth data" ON google_auth;
DROP POLICY IF EXISTS "Users can insert own google_auth data" ON google_auth;
DROP POLICY IF EXISTS "Users can update own google_auth data" ON google_auth;
DROP POLICY IF EXISTS "Users can delete own google_auth data" ON google_auth;

-- Create new policies that allow service role access
CREATE POLICY "Allow service role full access to google_auth" ON google_auth
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Also allow authenticated users to manage their own data
CREATE POLICY "Users can read own google_auth data" ON google_auth
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own google_auth data" ON google_auth
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own google_auth data" ON google_auth
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own google_auth data" ON google_auth
    FOR DELETE
    TO authenticated
    USING (auth.uid()::text = user_id); 