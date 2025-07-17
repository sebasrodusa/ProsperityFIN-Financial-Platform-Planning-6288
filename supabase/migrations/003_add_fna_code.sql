-- Add unique fna_code and optional claim columns
ALTER TABLE public.financial_analyses_pf
ADD COLUMN IF NOT EXISTS fna_code text UNIQUE;

ALTER TABLE public.financial_analyses_pf
ADD COLUMN IF NOT EXISTS client_email text;

ALTER TABLE public.financial_analyses_pf
ADD COLUMN IF NOT EXISTS claimed_at timestamptz;
