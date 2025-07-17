# ProsperityFIN Financial Platform

This project is a React application that uses Clerk for authentication and Supabase for data storage.

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
   # VITE_CLERK_SIGN_IN_URL, VITE_CLERK_SIGN_UP_URL and CLERK_WEBHOOK_SECRET
   ```
   The app will fail to start without valid Supabase and Clerk credentials. The
   Supabase URL and key must be provided via environment variables, otherwise the
   application will throw an error during startup.
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

Supabase serves as the data backend for this project, while Clerk handles authentication.

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

Migration `003_add_fna_code.sql` adds a `fna_code` text column (unique) along with optional `client_email` and `claimed_at` fields on the `financial_analyses_pf` table.
