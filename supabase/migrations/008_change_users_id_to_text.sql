-- Migrate users_pf primary key from uuid to text for Clerk compatibility
-- Convert existing uuid columns to text and adjust foreign keys

BEGIN;

-- Drop foreign keys referencing users_pf and clients_pf
ALTER TABLE IF EXISTS public.crm_client_notes_pf
  DROP CONSTRAINT IF EXISTS crm_client_notes_pf_client_id_fkey,
  DROP CONSTRAINT IF EXISTS crm_client_notes_pf_advisor_id_fkey;

-- Convert columns on users_pf and clients_pf
ALTER TABLE IF EXISTS public.users_pf
  ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE IF EXISTS public.clients_pf
  ALTER COLUMN id TYPE text USING id::text,
  ALTER COLUMN advisor_id TYPE text USING advisor_id::text;

-- Convert referencing columns in CRM notes table
ALTER TABLE IF EXISTS public.crm_client_notes_pf
  ALTER COLUMN client_id TYPE text USING client_id::text,
  ALTER COLUMN advisor_id TYPE text USING advisor_id::text;

-- Recreate foreign keys for CRM notes table
ALTER TABLE IF EXISTS public.crm_client_notes_pf
  ADD CONSTRAINT crm_client_notes_pf_client_id_fkey FOREIGN KEY (client_id)
    REFERENCES public.clients_pf(id) ON DELETE CASCADE,
  ADD CONSTRAINT crm_client_notes_pf_advisor_id_fkey FOREIGN KEY (advisor_id)
    REFERENCES public.users_pf(id) ON DELETE CASCADE;

-- Convert CRM status and task tables
ALTER TABLE IF EXISTS public.crm_client_statuses_pf
  ALTER COLUMN client_id TYPE text USING client_id::text,
  ALTER COLUMN advisor_id TYPE text USING advisor_id::text;

ALTER TABLE IF EXISTS public.crm_client_tasks_pf
  ALTER COLUMN client_id TYPE text USING client_id::text,
  ALTER COLUMN advisor_id TYPE text USING advisor_id::text;

ALTER TABLE IF EXISTS public.crm_status_history_pf
  ALTER COLUMN client_id TYPE text USING client_id::text,
  ALTER COLUMN advisor_id TYPE text USING advisor_id::text;

-- Convert financial analyses table
ALTER TABLE IF EXISTS public.financial_analyses_pf
  ALTER COLUMN client_id TYPE text USING client_id::text,
  ALTER COLUMN created_by TYPE text USING created_by::text;

-- Convert projections table
ALTER TABLE IF EXISTS public.projections_pf
  ALTER COLUMN client_id TYPE text USING client_id::text,
  ALTER COLUMN advisor_id TYPE text USING advisor_id::text,
  ALTER COLUMN created_by TYPE text USING created_by::text;

COMMIT;
