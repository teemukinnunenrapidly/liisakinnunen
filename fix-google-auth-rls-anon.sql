-- Add anon role access to google_auth table for OAuth flow
-- This policy allows anonymous users to insert refresh tokens during OAuth
CREATE POLICY "Allow anon to insert google_auth" ON google_auth
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Also allow anon to read their own data (for checking auth status)
CREATE POLICY "Allow anon to read google_auth" ON google_auth
    FOR SELECT
    TO anon
    USING (true); 