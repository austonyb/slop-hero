-- Create the images table
CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  is_ai BOOLEAN NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read images
CREATE POLICY "Allow public read access" ON images
  FOR SELECT USING (true);

-- Create a policy that allows authenticated users to insert images (for admins/uploaders)
-- For now, we'll allow public insert for seeding purposes, but in production this should be restricted
CREATE POLICY "Allow public insert for seeding" ON images
  FOR INSERT WITH CHECK (true);
