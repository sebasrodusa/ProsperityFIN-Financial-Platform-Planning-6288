-- Add Publitio integration fields and documents table

-- Store optional profile image information for each user
ALTER TABLE public.users_pf
  ADD COLUMN IF NOT EXISTS profile_image_url text,
  ADD COLUMN IF NOT EXISTS profile_image_id text;

-- Table for user or client documents stored on Publitio
CREATE TABLE public.documents_pf (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users_pf(id),
  client_id uuid REFERENCES public.clients_pf(id),
  name text,
  publitio_id text,
  url text,
  created_at timestamptz DEFAULT now()
);

-- Optionally add logo fields if carriers table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'carriers_pf' AND n.nspname = 'public'
  ) THEN
    ALTER TABLE public.carriers_pf
      ADD COLUMN IF NOT EXISTS logo_url text,
      ADD COLUMN IF NOT EXISTS logo_public_id text;
  END IF;
END$$;
