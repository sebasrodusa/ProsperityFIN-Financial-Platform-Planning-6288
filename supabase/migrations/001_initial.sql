-- Initial schema with Supabase Auth integration
-- Combines previous migrations and defines all tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table stores profile details linked to auth.users
CREATE TABLE public.users_pf (
  id text PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  advisor_id text REFERENCES public.users_pf(id),
  name text,
  email text,
  role text NOT NULL DEFAULT 'client',
  team_id text,
  agent_code text,
  avatar text,
  phone text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Clients managed by an advisor
CREATE TABLE public.clients_pf (
  id text PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  advisor_id text REFERENCES public.users_pf(id),
  created_by text REFERENCES public.users_pf(id),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  date_of_birth date,
  gender text,
  marital_status text,
  address text,
  employer_name text,
  has_access boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  target_revenue numeric,
  spouse_info jsonb,
  children_info jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Financial analyses for each client
CREATE TABLE public.financial_analyses_pf (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id text REFERENCES public.clients_pf(id) ON DELETE CASCADE,
  created_by text REFERENCES public.users_pf(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz,
  income_sources jsonb,
  expenses jsonb,
  assets jsonb,
  liabilities jsonb,
  insurance_policies jsonb,
  financial_goals jsonb,
  estate_checklist jsonb,
  insurance_calculator jsonb,
  legacy_wishes text,
  fna_code text UNIQUE,
  client_email text,
  claimed_at timestamptz
);

-- CRM tables
CREATE TABLE public.crm_client_statuses_pf (
  client_id text REFERENCES public.clients_pf(id) ON DELETE CASCADE,
  status text NOT NULL,
  updated_at timestamptz NOT NULL,
  advisor_id text REFERENCES public.users_pf(id) ON DELETE CASCADE,
  PRIMARY KEY (client_id)
);

CREATE TABLE public.crm_status_history_pf (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id text REFERENCES public.clients_pf(id) ON DELETE CASCADE,
  status text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL,
  advisor_id text REFERENCES public.users_pf(id) ON DELETE CASCADE
);

CREATE TABLE public.crm_client_tasks_pf (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id text REFERENCES public.clients_pf(id) ON DELETE CASCADE,
  advisor_id text REFERENCES public.users_pf(id) ON DELETE CASCADE,
  task_name text NOT NULL,
  description text,
  due_date date,
  completed boolean DEFAULT false,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE public.crm_client_notes_pf (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id text REFERENCES public.clients_pf(id) ON DELETE CASCADE,
  advisor_id text REFERENCES public.users_pf(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- Proposal / projection table
CREATE TABLE public.projections_pf (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id text REFERENCES public.clients_pf(id) ON DELETE CASCADE,
  advisor_id text REFERENCES public.users_pf(id) ON DELETE CASCADE,
  created_by text REFERENCES public.users_pf(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  strategy text,
  product_type text,
  carrier text,
  initial_lump_sum numeric,
  monthly_contribution numeric,
  annual_coi numeric,
  first_year_bonus numeric,
  years_to_pay integer,
  average_return_percentage numeric,
  death_benefit_amount numeric,
  living_benefits numeric,
  terminal_illness_benefit numeric,
  chronic_illness_benefit numeric,
  critical_illness_benefit numeric,
  average_monthly_cost numeric,
  ten_year_income numeric,
  lifetime_income numeric,
  status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Enable row level security policies
ALTER TABLE public.users_pf ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own advisor or self" ON public.users_pf
  FOR ALL USING (auth.uid() = id OR auth.uid() = advisor_id)
  WITH CHECK (auth.uid() = id OR auth.uid() = advisor_id);

ALTER TABLE public.clients_pf ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients advisor or self" ON public.clients_pf
  FOR ALL USING (auth.uid() = id OR auth.uid() = advisor_id)
  WITH CHECK (auth.uid() = id OR auth.uid() = advisor_id);

ALTER TABLE public.financial_analyses_pf ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Financial analyses owner" ON public.financial_analyses_pf
  FOR ALL USING (auth.uid() = created_by OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = created_by OR auth.uid() = client_id);

ALTER TABLE public.crm_client_notes_pf ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRM notes owner" ON public.crm_client_notes_pf
  FOR ALL USING (auth.uid() = advisor_id OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);

ALTER TABLE public.projections_pf ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projections owner" ON public.projections_pf
  FOR ALL USING (auth.uid() = advisor_id OR auth.uid() = client_id OR auth.uid() = created_by)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id OR auth.uid() = created_by);

ALTER TABLE public.crm_client_statuses_pf ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRM statuses owner" ON public.crm_client_statuses_pf
  FOR ALL USING (auth.uid() = advisor_id OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);

ALTER TABLE public.crm_client_tasks_pf ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRM tasks owner" ON public.crm_client_tasks_pf
  FOR ALL USING (auth.uid() = advisor_id OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);

ALTER TABLE public.crm_status_history_pf ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CRM history owner" ON public.crm_status_history_pf
  FOR ALL USING (auth.uid() = advisor_id OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);

