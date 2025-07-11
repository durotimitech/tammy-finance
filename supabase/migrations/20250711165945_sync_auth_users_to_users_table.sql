create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, created_at, first_name, last_name)
  values (
    new.id,
    new.email,
    now(),
    (new.raw_user_meta_data->>'first_name'),
    (new.raw_user_meta_data->>'last_name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
