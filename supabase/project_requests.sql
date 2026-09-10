create extension if not exists pgcrypto;

create table if not exists public.project_requests (
  id uuid primary key default gen_random_uuid(),
  project_type text not null,
  description text not null,
  project_references text,
  deadline date,
  budget text,
  name text not null,
  contact text not null,
  created_at timestamptz not null default now()
);

alter table public.project_requests enable row level security;

-- The server function writes with the private service-role key.
-- No public insert policy is intentionally created.
