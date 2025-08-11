# AI Coding Agent Guide for this Repo

This project is a Vite + React PWA frontend backed by Supabase (Postgres + Edge Functions). Data flows from AniList GraphQL into a normalized schema, and the UI reads home sections via RPCs and an edge function.

Architecture and data flow
- Frontend (Vite React TS): key dirs in `src/` (pages, components, repositories). Homepage calls edge function `get-home-data` then falls back to a repository query.
  - Example: `src/pages/Index.tsx`, `src/repositories/contentRepository.ts`.
  - Supabase client: `src/integrations/supabase/client.ts`; env resolution: `src/config/environment.ts`.
- Backend (Supabase):
  - Schema: normalized content tables defined in `supabase/migrations/20250808130000_essential_schema.sql` (tables: `titles`, `anime_details`, `manga_details`, `genres`, `studios`, `authors`, and join tables). Unique per-title details: `ux_anime_details_title_id`, `ux_manga_details_title_id`.
  - RPCs for home: `supabase/migrations/20250808140000_add_rpc_functions.sql` (get_trending_anime/manga, get_recent_anime/manga). These use LEFT JOINs so titles with missing details still appear.
  - Edge functions: `supabase/functions/*` (Deno). Importers `import-anime` and `import-manga` upsert titles and details, and map genres/studios/authors. Orchestrators: `import-data`, `import-data-enhanced`, `scheduled-import`. Home data: `get-home-data` calls the RPCs with CORS/ETag and a standard response envelope.

Response conventions (Edge Functions)
- Always return an envelope: `{ success, data, error, meta }` and set CORS headers. Include `x-correlation-id` (generate if missing), `Cache-Control`, and `ETag` where applicable.
  - Examples: `supabase/functions/get-home-data/index.ts`, `supabase/functions/import-*/index.ts`.

Local dev and env
- Use `.env.local` (already present) with:
  - `VITE_SUPABASE_URL=http://127.0.0.1:54321`
  - `VITE_SUPABASE_ANON_KEY=<local anon>`
- Start services:
  - Frontend: `npm run dev` (Vite on http://localhost:8080)
  - Supabase local: `npx supabase start` (API: 54321, DB: 54322, Studio: 54323)
- Apply DB schema: prefer adding a migration under `supabase/migrations/`. For quick local apply you can run `supabase db reset` (or `psql -f` specific migration files).

Essential workflows
- Import data (AniList): `npm run import:scheduled` (triggers `scheduled-import` → `import-data-enhanced` → `import-anime`/`import-manga`). Importers include polite delays for rate limiting.
- Deploy edge functions (remote):
  - All: `npm run functions:deploy:all`
  - Single: `supabase functions deploy <name> --workdir ./supabase --project-ref <ref>`
- Run tests:
  - Unit: `npm run test:unit`
  - E2E smoke: `npm run e2e:smoke`

Backend specifics and patterns
- Titles are keyed by `anilist_id` (unique). Details are keyed by `title_id` (unique index) for idempotent upserts.
- Home RPCs select from `titles` with LEFT JOIN into detail tables and limit via `limit_param`. Trending orders by `popularity, score`; Recent orders by `created_at`.
- Edge functions should use service role inside Deno: read from `SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY`. JWT verification for public functions is disabled in `supabase/config.toml` via `verify_jwt = false`.

Frontend patterns
- Prefer calling the `get-home-data` edge function for home sections. Repository methods should use relaxed joins and Zod validation when mapping rows (see `contentRepository.ts`).
- PWA caching: the `vite.config.ts` workbox runtimeCaching targets the remote Supabase domain. SW is disabled in dev; for prod builds be mindful of cached API responses.

Gotchas
- If home sections are empty locally, ensure: (1) imports ran, (2) RPCs use LEFT JOIN, (3) RLS is not blocking (a temporary RLS-disable migration exists).
- Use anon key in the browser only; never expose service role.
- When changing schema, add a new migration rather than editing historic ones. Keep RPC signatures stable unless you also update callers (`get-home-data`).

Where to look first
- Home pipeline: `get-home-data` → RPCs in `migrations/*add_rpc_functions.sql` → schema in `*essential_schema.sql` → importers under `functions/import-*`.
- Environment and keys: `.env.local`, `src/config/environment.ts`, `supabase/config.toml`.
