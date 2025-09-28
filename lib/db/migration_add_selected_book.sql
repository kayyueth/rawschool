-- Migration: Add selected_book field to recommendation table
-- This migration adds the selected_book field to track which book the applicant wants to join

-- Add the selected_book column to the recommendation table
ALTER TABLE public.recommendation 
ADD COLUMN IF NOT EXISTS selected_book TEXT NOT NULL DEFAULT '';

-- Add an index for better query performance on selected_book
CREATE INDEX IF NOT EXISTS idx_recommendation_selected_book ON public.recommendation(selected_book);

-- Update the existing records to have a default value (if any exist)
-- This ensures existing records have a valid selected_book value
UPDATE public.recommendation 
SET selected_book = 'Not specified' 
WHERE selected_book = '';

-- Add a comment to document the new field
COMMENT ON COLUMN public.recommendation.selected_book IS 'The book the applicant selected to join for this month''s bookclub session';
