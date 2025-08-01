-- Row Level Security (RLS) policies for artikkelit table
-- This allows public read access to articles

-- Enable RLS on the artikkelit table
ALTER TABLE artikkelit ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read (SELECT) all articles
CREATE POLICY "Allow public read access to artikkelit" ON artikkelit
    FOR SELECT
    TO anon
    USING (true);

-- Optional: Create a policy for authenticated users to insert articles
-- Uncomment if you want to allow authenticated users to create articles
-- CREATE POLICY "Allow authenticated users to insert artikkelit" ON artikkelit
--     FOR INSERT
--     TO authenticated
--     WITH CHECK (true);

-- Optional: Create a policy for authenticated users to update articles
-- Uncomment if you want to allow authenticated users to update articles
-- CREATE POLICY "Allow authenticated users to update artikkelit" ON artikkelit
--     FOR UPDATE
--     TO authenticated
--     USING (true)
--     WITH CHECK (true);

-- Optional: Create a policy for authenticated users to delete articles
-- Uncomment if you want to allow authenticated users to delete articles
-- CREATE POLICY "Allow authenticated users to delete artikkelit" ON artikkelit
--     FOR DELETE
--     TO authenticated
--     USING (true); 