-- Add featured flag to strategies
ALTER TABLE public.strategies_pf
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
