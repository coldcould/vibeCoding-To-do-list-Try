create table if not exists public.app_users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.lists (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  name text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

create table if not exists public.tasks (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  list_id text references public.lists(id) on delete set null,
  title text not null,
  category text not null,
  completed boolean not null default false,
  priority text check (priority in ('Low', 'Medium', 'High')),
  scheduled_for date not null default current_date,
  planned_time text,
  is_running boolean not null default false,
  elapsed_seconds integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.password_reset_tokens (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_scheduled_for_idx on public.tasks(scheduled_for);
create index if not exists password_reset_tokens_user_id_idx on public.password_reset_tokens(user_id);
create index if not exists password_reset_tokens_expires_at_idx on public.password_reset_tokens(expires_at);

alter table public.app_users enable row level security;
alter table public.lists enable row level security;
alter table public.tasks enable row level security;
alter table public.password_reset_tokens enable row level security;
