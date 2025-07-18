-- Remove obsolete CRM columns from clients_pf
ALTER TABLE public.clients_pf DROP COLUMN IF EXISTS crm_status;
ALTER TABLE public.clients_pf DROP COLUMN IF EXISTS crm_notes;
ALTER TABLE public.clients_pf DROP COLUMN IF EXISTS crm_tasks;
ALTER TABLE public.clients_pf DROP COLUMN IF EXISTS status_history;
ALTER TABLE public.clients_pf DROP COLUMN IF EXISTS last_activity;
