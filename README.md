# Serene Flow

Serene Flow is now a full-stack web app:

- Frontend: React + Vite
- Backend: Express + TypeScript
- Database: Supabase Postgres

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in:

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SESSION_SECRET=...
PORT=3001
```

Important:
- `SUPABASE_SERVICE_ROLE_KEY` must be the `service_role` key
- Do not use the `anon` key here
- This project keeps RLS enabled and relies on the backend's `service_role` key for privileged server-side access

## 3. Create the database tables

Run the SQL in [supabase/schema.sql](/C:/Users/33731/Downloads/serene-flow/supabase/schema.sql) inside the Supabase SQL editor.

If you already created the earlier version of the schema, rerun the updated SQL so the `password_reset_tokens` table is added too.
The updated schema also explicitly enables RLS on the app tables.

## 4. Start the app

Run the backend:

```bash
npm run dev:server
```

Run the frontend in another terminal:

```bash
npm run dev:client
```

Frontend runs on `http://127.0.0.1:3000`.
Backend runs on `http://127.0.0.1:3001`.

Vite is already configured to proxy `/api` requests to the backend.

## Password reset flow

The app now supports a database-backed password reset flow:

- Submit your email in "Forgot Password"
- The backend creates a one-time reset token in Supabase
- The frontend shows a reset link for local/dev use
- Opening that link takes you to the reset-password form

## Production build

```bash
npm run build
npm run start
```

The Express server will serve the built frontend from `dist/` and expose the API from the same app.
