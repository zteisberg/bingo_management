create extension if not exists pgcrypto;
create type public.tile_status as enum ('open','in_progress','complete');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  discord_username text not null default '', avatar_url text,
  is_verified boolean not null default false, is_admin boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.sections (
  id text primary key, name text not null, unlocked boolean not null default false,
  row integer not null check(row>0), col integer not null check(col>0),
  tile_cols integer not null default 3 check(tile_cols between 1 and 6)
);
create table public.tiles (
  id uuid primary key default gen_random_uuid(), section_id text not null references public.sections(id) on delete cascade,
  name text not null, description text not null default '', row integer not null check(row>0), col integer not null check(col>0),
  status public.tile_status not null default 'open', time_estimate text not null default '', strategy text not null default '',
  unique(section_id,row,col)
);
create table public.tile_gateways (
  tile_id uuid not null references public.tiles(id) on delete cascade,
  section_id text not null references public.sections(id) on delete cascade,
  primary key(tile_id,section_id)
);
create table public.tile_contributors (
  tile_id uuid not null references public.tiles(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  note text not null default '' check(char_length(note)<=500), created_at timestamptz not null default now(),
  primary key(tile_id,profile_id)
);

create or replace function public.is_verified() returns boolean language sql stable security definer set search_path='' as $$
  select coalesce((select p.is_verified from public.profiles p where p.id=auth.uid()),false)
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
  select coalesce((select p.is_verified and p.is_admin from public.profiles p where p.id=auth.uid()),false)
$$;
revoke all on function public.is_verified() from public; revoke all on function public.is_admin() from public;
grant execute on function public.is_verified() to authenticated; grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security; alter table public.sections enable row level security;
alter table public.tiles enable row level security; alter table public.tile_gateways enable row level security; alter table public.tile_contributors enable row level security;
create policy "verified read profiles" on public.profiles for select to authenticated using(public.is_verified());
create policy "verified read sections" on public.sections for select to authenticated using(public.is_verified());
create policy "verified read tiles" on public.tiles for select to authenticated using(public.is_verified());
create policy "verified read gateways" on public.tile_gateways for select to authenticated using(public.is_verified());
create policy "verified read contributors" on public.tile_contributors for select to authenticated using(public.is_verified());
create policy "admins update sections" on public.sections for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admins update tiles" on public.tiles for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admins add gateways" on public.tile_gateways for insert to authenticated with check(public.is_admin());
create policy "admins remove gateways" on public.tile_gateways for delete to authenticated using(public.is_admin());
create policy "members add self" on public.tile_contributors for insert to authenticated with check(public.is_verified() and profile_id=auth.uid());
create policy "members edit self" on public.tile_contributors for update to authenticated using(public.is_verified() and profile_id=auth.uid()) with check(public.is_verified() and profile_id=auth.uid());
create policy "members remove self" on public.tile_contributors for delete to authenticated using(public.is_verified() and profile_id=auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,discord_username,avatar_url)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name','Discord user'),new.raw_user_meta_data->>'avatar_url')
  on conflict(id) do update set discord_username=excluded.discord_username,avatar_url=excluded.avatar_url,updated_at=now();
  return new;
end $$;
create trigger on_auth_user_created after insert or update of raw_user_meta_data on auth.users for each row execute function public.handle_new_user();

create or replace function public.unlock_completed_gateway_sections() returns trigger language plpgsql security definer set search_path='' as $$
declare destination text;
begin
  if new.status='complete' and old.status is distinct from new.status then
    for destination in select g.section_id from public.tile_gateways g where g.tile_id=new.id loop
      update public.sections s set unlocked=true where s.id=destination
        and exists(select 1 from public.tile_gateways g where g.section_id=destination)
        and not exists(
          select 1 from public.tile_gateways g join public.tiles t on t.id=g.tile_id
          where g.section_id=destination and t.status<>'complete'
        );
    end loop;
  end if;
  return new;
end $$;
create trigger unlock_gateway_after_tile_update after update of status on public.tiles for each row execute function public.unlock_completed_gateway_sections();

alter publication supabase_realtime add table public.sections,public.tiles,public.tile_contributors;
create index tiles_section_idx on public.tiles(section_id); create index tile_gateways_section_idx on public.tile_gateways(section_id);
