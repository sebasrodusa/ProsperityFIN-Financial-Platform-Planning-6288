-- Create table for client notes
CREATE TABLE IF NOT EXISTS public.crm_client_notes_pf (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id text REFERENCES public.clients_pf(id) ON DELETE CASCADE,
  advisor_id text REFERENCES public.users_pf(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
