-- Enable RLS and policies for proposal and CRM tables

-- Projections table
ALTER TABLE public.projections_pf ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Projections owner" ON public.projections_pf;
CREATE POLICY "Projections owner" ON public.projections_pf
  FOR ALL
  USING (auth.uid() = advisor_id OR auth.uid() = client_id OR auth.uid() = created_by)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id OR auth.uid() = created_by);

-- CRM client statuses table
ALTER TABLE public.crm_client_statuses_pf ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "CRM statuses owner" ON public.crm_client_statuses_pf;
CREATE POLICY "CRM statuses owner" ON public.crm_client_statuses_pf
  FOR ALL
  USING (auth.uid() = advisor_id OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);

-- CRM client tasks table
ALTER TABLE public.crm_client_tasks_pf ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "CRM tasks owner" ON public.crm_client_tasks_pf;
CREATE POLICY "CRM tasks owner" ON public.crm_client_tasks_pf
  FOR ALL
  USING (auth.uid() = advisor_id OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);

-- CRM status history table
ALTER TABLE public.crm_status_history_pf ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "CRM history owner" ON public.crm_status_history_pf;
CREATE POLICY "CRM history owner" ON public.crm_status_history_pf
  FOR ALL
  USING (auth.uid() = advisor_id OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);
