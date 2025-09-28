-- Migration script to add selected_book field and make book recommendation fields optional
-- Run this script on your existing Supabase database

-- Add the selected_book column
ALTER TABLE public.recommendation 
ADD COLUMN IF NOT EXISTS selected_book TEXT;

-- Set a default value for existing records
UPDATE public.recommendation 
SET selected_book = 'Not specified' 
WHERE selected_book IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE public.recommendation 
ALTER COLUMN selected_book SET NOT NULL;

-- Make book recommendation fields optional (allow NULL values)
ALTER TABLE public.recommendation 
ALTER COLUMN book_name DROP NOT NULL;

ALTER TABLE public.recommendation 
ALTER COLUMN expected_read_weeks DROP NOT NULL;

ALTER TABLE public.recommendation 
ALTER COLUMN recommendation DROP NOT NULL;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_recommendation_selected_book ON public.recommendation(selected_book);

-- Add comments to document the fields
COMMENT ON COLUMN public.recommendation.selected_book IS 'The book the applicant selected to join for this month''s bookclub session';
COMMENT ON COLUMN public.recommendation.book_name IS 'The book name recommended by the applicant (optional)';
COMMENT ON COLUMN public.recommendation.expected_read_weeks IS 'Number of weeks expected to read the recommended book (optional)';
COMMENT ON COLUMN public.recommendation.recommendation IS 'Reason why the applicant recommends this book (optional)';
