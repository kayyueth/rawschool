-- Create recommendation table
CREATE TABLE IF NOT EXISTS public.recommendation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Applicant information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Book recommendation details
  book_name TEXT NOT NULL,
  expected_read_weeks INTEGER NOT NULL CHECK (expected_read_weeks > 0),
  recommendation TEXT NOT NULL,
  
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

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_recommendation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_recommendation_updated_at
BEFORE UPDATE ON public.recommendation
FOR EACH ROW
EXECUTE FUNCTION update_recommendation_updated_at();

-- Enable RLS
ALTER TABLE public.recommendation ENABLE ROW LEVEL SECURITY;

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
