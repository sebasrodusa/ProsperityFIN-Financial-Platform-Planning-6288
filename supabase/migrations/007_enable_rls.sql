-- Enable RLS and define policies for additional CRM tables

-- Projections table
ALTER TABLE public.projections_pf ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Projections select" ON public.projections_pf;
DROP POLICY IF EXISTS "Projections insert" ON public.projections_pf;
DROP POLICY IF EXISTS "Projections update" ON public.projections_pf;
DROP POLICY IF EXISTS "Projections delete" ON public.projections_pf;
CREATE POLICY "Projections select" ON public.projections_pf
  FOR SELECT
  USING (auth.uid() = advisor_id OR auth.uid() = client_id OR auth.uid() = created_by);
CREATE POLICY "Projections insert" ON public.projections_pf
  FOR INSERT
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id OR auth.uid() = created_by);
CREATE POLICY "Projections update" ON public.projections_pf
  FOR UPDATE
  USING (auth.uid() = advisor_id OR auth.uid() = client_id OR auth.uid() = created_by)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id OR auth.uid() = created_by);
CREATE POLICY "Projections delete" ON public.projections_pf
  FOR DELETE
  USING (auth.uid() = advisor_id OR auth.uid() = client_id OR auth.uid() = created_by);

-- CRM client statuses table
ALTER TABLE public.crm_client_statuses_pf ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "CRM statuses select" ON public.crm_client_statuses_pf;
DROP POLICY IF EXISTS "CRM statuses insert" ON public.crm_client_statuses_pf;
DROP POLICY IF EXISTS "CRM statuses update" ON public.crm_client_statuses_pf;
DROP POLICY IF EXISTS "CRM statuses delete" ON public.crm_client_statuses_pf;
CREATE POLICY "CRM statuses select" ON public.crm_client_statuses_pf
  FOR SELECT
  USING (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "CRM statuses insert" ON public.crm_client_statuses_pf
  FOR INSERT
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "CRM statuses update" ON public.crm_client_statuses_pf
  FOR UPDATE
  USING (auth.uid() = advisor_id OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "CRM statuses delete" ON public.crm_client_statuses_pf
  FOR DELETE
  USING (auth.uid() = advisor_id OR auth.uid() = client_id);

-- CRM client tasks table
ALTER TABLE public.crm_client_tasks_pf ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "CRM tasks select" ON public.crm_client_tasks_pf;
DROP POLICY IF EXISTS "CRM tasks insert" ON public.crm_client_tasks_pf;
DROP POLICY IF EXISTS "CRM tasks update" ON public.crm_client_tasks_pf;
DROP POLICY IF EXISTS "CRM tasks delete" ON public.crm_client_tasks_pf;
CREATE POLICY "CRM tasks select" ON public.crm_client_tasks_pf
  FOR SELECT
  USING (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "CRM tasks insert" ON public.crm_client_tasks_pf
  FOR INSERT
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "CRM tasks update" ON public.crm_client_tasks_pf
  FOR UPDATE
  USING (auth.uid() = advisor_id OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "CRM tasks delete" ON public.crm_client_tasks_pf
  FOR DELETE
  USING (auth.uid() = advisor_id OR auth.uid() = client_id);

-- CRM status history table
ALTER TABLE public.crm_status_history_pf ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "CRM history select" ON public.crm_status_history_pf;
DROP POLICY IF EXISTS "CRM history insert" ON public.crm_status_history_pf;
DROP POLICY IF EXISTS "CRM history update" ON public.crm_status_history_pf;
DROP POLICY IF EXISTS "CRM history delete" ON public.crm_status_history_pf;
CREATE POLICY "CRM history select" ON public.crm_status_history_pf
  FOR SELECT
  USING (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "CRM history insert" ON public.crm_status_history_pf
  FOR INSERT
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "CRM history update" ON public.crm_status_history_pf
  FOR UPDATE
  USING (auth.uid() = advisor_id OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "CRM history delete" ON public.crm_status_history_pf
  FOR DELETE
  USING (auth.uid() = advisor_id OR auth.uid() = client_id);

