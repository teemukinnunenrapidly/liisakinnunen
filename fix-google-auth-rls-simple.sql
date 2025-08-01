-- Add service role access to google_auth table (only if it doesn't exist)
-- This policy allows the service role to access the google_auth table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'google_auth' 
        AND policyname = 'Allow service role full access to google_auth'
    ) THEN
        CREATE POLICY "Allow service role full access to google_auth" ON google_auth
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$; 