# ProsperityFIN Financial Platform

This project is a React application that uses Supabase for authentication and data storage.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and provide your Supabase credentials:
   ```bash
   cp .env.example .env
   # Edit .env with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```
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

Supabase powers both authentication and data storage for this project.
