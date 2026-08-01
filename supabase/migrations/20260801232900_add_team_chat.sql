create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index chat_messages_created_at_idx on public.chat_messages(created_at desc);
create index chat_messages_profile_id_idx on public.chat_messages(profile_id);

alter table public.chat_messages enable row level security;

grant select, delete on public.chat_messages to authenticated;
grant insert (profile_id, body) on public.chat_messages to authenticated;

create policy "verified read chat"
on public.chat_messages for select to authenticated
using ((select private.is_verified()));

create policy "verified send chat"
on public.chat_messages for insert to authenticated
with check (
  (select private.is_verified())
  and profile_id = (select auth.uid())
);

create policy "members or admins delete chat"
on public.chat_messages for delete to authenticated
using (
  (select private.is_verified())
  and (profile_id = (select auth.uid()) or (select private.is_admin()))
);

alter publication supabase_realtime add table public.chat_messages;
