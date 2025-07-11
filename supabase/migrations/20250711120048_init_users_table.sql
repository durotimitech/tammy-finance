create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  created_at timestamp with time zone default timezone('utc', now()) not null
);
