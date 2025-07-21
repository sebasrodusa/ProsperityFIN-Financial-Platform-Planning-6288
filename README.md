# ProsperityFIN Financial Platform

This project is a React application that uses Clerk for authentication and Supabase for data storage.

Row level security (**RLS**) is enabled across all user data tables to ensure records are only accessible to their owner and advisor.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the required environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
   # VITE_CLERK_PUBLISHABLE_KEY, VITE_CLERK_FRONTEND_API,
   # VITE_CLERK_SIGN_IN_URL, VITE_CLERK_SIGN_UP_URL,
   # CLERK_WEBHOOK_SECRET, CLERK_JWT_KEY and SUPABASE_SERVICE_ROLE_KEY
   ```
   The app will fail to start without valid Supabase and Clerk credentials. The
   Supabase URL and key must be provided via environment variables, otherwise the
   application will throw an error during startup.

  * `CLERK_JWT_KEY` can be found in the **Clerk dashboard** under **API Keys → JWT Verification Key**. Copy the entire PEM string into your `.env` file. This key allows the backend to validate Clerk-issued JWTs.
  * `SUPABASE_SERVICE_ROLE_KEY` lives in the **Supabase dashboard** under **Settings → API → Service Role**. Keep this key private as it bypasses RLS and is required for service-role operations such as migrations, seeding data, and other backend tasks that need unrestricted access.

    Any API route or server-side function that must bypass RLS—like the Clerk webhook—should create its own Supabase client using this key.

Both variables are required for JWT authentication and service-role database access.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
5. (Optional) Preview the production build locally:
   ```bash
   npm run preview
   ```

Supabase serves as the data backend for this project, while Clerk handles authentication and issues the JWTs used to authorize access to Supabase.

## Role Metadata

The application reads each user's role from `user.publicMetadata.role`. To give
your user administrative permissions during development:

1. Open the **Users** page in the Clerk dashboard and select your account.
2. Update the **Public Metadata** field to:
   ```json
   { "role": "admin" }
   ```
3. Save the changes, then sign out and sign back in so the new role is loaded.

## Database Migrations

Supabase schema changes live in `supabase/migrations`. Apply them to a local database with the Supabase CLI:

```bash
supabase db reset
```
Migration `006_enable_rls.sql` turns on row level security for the core tables. `007_enable_rls.sql` extends the policies to CRM and proposal tables. Run `supabase db reset` after pulling to apply them locally.

### Enabling RLS

The `006_enable_rls.sql` and `007_enable_rls.sql` migrations enable row level security policies for all tables that hold user data. Each policy checks that `auth.uid()` matches columns such as `created_by`, `advisor_id` or `client_id` before allowing reads or writes. Apply the migrations to your Supabase project with `supabase db push` or through the dashboard. After the SQL is applied, open each table in the Supabase dashboard and verify that **Enable RLS** is turned on.

Migration `003_add_fna_code.sql` adds a `fna_code` text column (unique) along with optional `client_email` and `claimed_at` fields on the `financial_analyses_pf` table.

## FNA Codes

Each financial analysis receives a unique **FNA code**. This code is automatically generated when the analysis is created and appears on the Financial Analysis page next to the save confirmation banner. Share the FNA code with your client so they can claim the analysis in the Client Portal.

**How it works**

* The application generates the FNA code automatically when a new analysis is saved.
* The code is shown on the Financial Analysis page right beside the save confirmation.
* Clients can enter this code in the portal to claim the analysis and link it to their account.
