-- Job locks table for idempotent imports
create table if not exists public.job_locks (
  id text primary key,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Simple policy to allow service role usage only; RLS not required for service key
alter table public.job_locks enable row level security;
create policy "service role only" on public.job_locks
  for all
  to service_role
  using (true)
  with check (true);

-- Index for expiry sweeps
create index if not exists idx_job_locks_expires_at on public.job_locks (expires_at);
