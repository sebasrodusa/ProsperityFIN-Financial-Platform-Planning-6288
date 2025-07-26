# ProsperityFIN Financial Platform

This project is a React application that uses Supabase for authentication and data storage.

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
   # SUPABASE_SERVICE_ROLE_KEY, PUBLITIO_API_KEY and PUBLITIO_API_SECRET
   ```
   The app will fail to start without valid Supabase credentials. The
   Supabase URL and key must be provided via environment variables, otherwise the
   application will throw an error during startup.

  * `SUPABASE_SERVICE_ROLE_KEY` lives in the **Supabase dashboard** under **Settings → API → Service Role**. Keep this key private as it bypasses RLS and is required for service-role operations such as migrations, seeding data, and other backend tasks that need unrestricted access.

    Any API route or server-side function that must bypass RLS should create its own Supabase client using this key.

The service role key is required for JWT authentication and service-role database access.
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

Supabase serves as both the data backend and authentication provider for this project. Supabase Auth issues the JWTs used to authorize database access.

## Role Metadata

The application reads each user's role from `user.role`. To give
your user administrative permissions during development:

1. Open the **Auth → Users** page in the Supabase dashboard and select your account.
2. Update the **User Metadata** field to:
   ```json
   { "role": "admin" }
   ```
3. Save the changes, then sign out and sign back in so the new role is loaded.

## Database Migrations

Supabase schema changes live in `supabase/migrations`. Apply them to a local database with the Supabase CLI:

```bash
supabase db reset
```
All schema changes live in `supabase/migrations/001_initial.sql`. This baseline migration creates the tables and row level security policies required by the application. Run `supabase db reset` after pulling to apply the latest schema locally.

## FNA Codes

Each financial analysis receives a unique **FNA code**. This code is automatically generated when the analysis is created and appears on the Financial Analysis page next to the save confirmation banner. Share the FNA code with your client so they can claim the analysis in the Client Portal.

**How it works**

* The application generates the FNA code automatically when a new analysis is saved.
* The code is shown on the Financial Analysis page right beside the save confirmation.
* Clients can enter this code in the portal to claim the analysis and link it to their account.
