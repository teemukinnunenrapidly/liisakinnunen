-- Create google_auth table for Google authentication
CREATE TABLE google_auth (
    user_id TEXT PRIMARY KEY,
    refresh_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE google_auth ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read own google_auth data" ON google_auth
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = user_id);

-- Create policy for users to insert their own data
CREATE POLICY "Users can insert own google_auth data" ON google_auth
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = user_id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update own google_auth data" ON google_auth
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- Create policy for users to delete their own data
CREATE POLICY "Users can delete own google_auth data" ON google_auth
    FOR DELETE
    TO authenticated
    USING (auth.uid()::text = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_google_auth_updated_at 
    BEFORE UPDATE ON google_auth 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 