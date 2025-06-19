create table if not exists public.config (
  id uuid primary key default gen_random_uuid(),
  login_logo_url text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

insert into public.config (login_logo_url)
values ('https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=120&q=80')
on conflict do nothing;

alter table public.config enable row level security;

drop policy if exists "Allow anonymous read access" on public.config;
create policy "Allow anonymous read access"
on public.config
for select
using (true);

alter publication supabase_realtime add table config;