drop policy if exists "Allow authenticated update access" on public.config;
create policy "Allow authenticated update access"
on public.config
for update
using (auth.role() = 'authenticated');

create or replace function update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.config;

create trigger set_updated_at
before update on public.config
for each row
execute function update_updated_at_column();