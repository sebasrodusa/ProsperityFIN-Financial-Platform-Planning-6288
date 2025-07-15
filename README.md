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
   # VITE_CLERK_PUBLISHABLE_KEY and CLERK_WEBHOOK_SECRET
   ```
   The app will fail to start without valid Supabase credentials.
   `VITE_CLERK_SECRET_KEY` and `VITE_CLERK_FRONTEND_API` are not used by this project.
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
