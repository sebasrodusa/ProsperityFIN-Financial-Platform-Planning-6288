-- Enable row level security and policies for core tables

-- Users table
ALTER TABLE public.users_pf ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own advisor or self" ON public.users_pf;
CREATE POLICY "Users own advisor or self" ON public.users_pf
  FOR ALL
  USING (auth.uid() = id OR auth.uid() = advisor_id)
  WITH CHECK (auth.uid() = id OR auth.uid() = advisor_id);

-- Clients table
ALTER TABLE public.clients_pf ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clients advisor or self" ON public.clients_pf;
CREATE POLICY "Clients advisor or self" ON public.clients_pf
  FOR ALL
  USING (auth.uid() = id OR auth.uid() = advisor_id)
  WITH CHECK (auth.uid() = id OR auth.uid() = advisor_id);

-- Financial analyses table
ALTER TABLE public.financial_analyses_pf ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Financial analyses owner" ON public.financial_analyses_pf;
CREATE POLICY "Financial analyses owner" ON public.financial_analyses_pf
  FOR ALL
  USING (auth.uid() = created_by OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = created_by OR auth.uid() = client_id);

-- CRM client notes table
ALTER TABLE public.crm_client_notes_pf ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "CRM notes owner" ON public.crm_client_notes_pf;
CREATE POLICY "CRM notes owner" ON public.crm_client_notes_pf
  FOR ALL
  USING (auth.uid() = advisor_id OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);
