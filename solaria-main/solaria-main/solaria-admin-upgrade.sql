-- Run once in Supabase > SQL Editor. Makes admin access depend ONLY on the admins table (user id),
-- never on an email match, so a customer can't become admin by registering/confirming a look-alike email.
update public.admins a set user_id = u.id from auth.users u
 where a.user_id is null and lower(a.email) = lower(u.email);
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;
