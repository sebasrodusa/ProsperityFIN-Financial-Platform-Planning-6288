-- Add estate_checklist column to financial_analyses_pf
ALTER TABLE public.financial_analyses_pf
ADD COLUMN IF NOT EXISTS estate_checklist jsonb;
