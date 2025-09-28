-- Updated recommendation table with selected_book field
-- This file contains the complete updated schema for the recommendation table

-- Drop the existing table if it exists (use with caution in production)
-- DROP TABLE IF EXISTS public.recommendation CASCADE;

-- Create recommendation table with selected_book field
CREATE TABLE IF NOT EXISTS public.recommendation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Applicant information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Book selection and recommendation details
  selected_book TEXT NOT NULL, -- NEW FIELD: The book the applicant wants to join
  book_name TEXT, -- Optional: Book recommendation
  expected_read_weeks INTEGER CHECK (expected_read_weeks > 0), -- Optional
  recommendation TEXT, -- Optional
  
  -- Application status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted')),
  
  -- Admin notes (for community manager)
  admin_notes TEXT,
  reviewed_by TEXT, -- email of reviewer
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recommendation_email ON public.recommendation(email);
CREATE INDEX IF NOT EXISTS idx_recommendation_status ON public.recommendation(status);
CREATE INDEX IF NOT EXISTS idx_recommendation_created_at ON public.recommendation(created_at);
CREATE INDEX IF NOT EXISTS idx_recommendation_selected_book ON public.recommendation(selected_book);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_recommendation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_recommendation_updated_at ON public.recommendation;
CREATE TRIGGER update_recommendation_updated_at
BEFORE UPDATE ON public.recommendation
FOR EACH ROW
EXECUTE FUNCTION update_recommendation_updated_at();

-- Enable RLS
ALTER TABLE public.recommendation ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public application submission" ON public.recommendation;
DROP POLICY IF EXISTS "Allow community manager to view applications" ON public.recommendation;
DROP POLICY IF EXISTS "Allow community manager to update applications" ON public.recommendation;

-- RLS policies
-- Allow anyone to insert applications (public applications)
CREATE POLICY "Allow public application submission" ON public.recommendation
  FOR INSERT WITH CHECK (true);

-- Allow community manager to view all applications
CREATE POLICY "Allow community manager to view applications" ON public.recommendation
  FOR SELECT USING (true);

-- Allow community manager to update applications
CREATE POLICY "Allow community manager to update applications" ON public.recommendation
  FOR UPDATE USING (true);

-- Add comments to document the fields
COMMENT ON COLUMN public.recommendation.selected_book IS 'The book the applicant selected to join for this month''s bookclub session';
COMMENT ON COLUMN public.recommendation.book_name IS 'The book name recommended by the applicant';
COMMENT ON COLUMN public.recommendation.expected_read_weeks IS 'Number of weeks expected to read the recommended book';
COMMENT ON COLUMN public.recommendation.recommendation IS 'Reason why the applicant recommends this book';
