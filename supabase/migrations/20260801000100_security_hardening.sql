create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

revoke all on function public.is_verified() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.unlock_completed_gateway_sections() from public, anon, authenticated;

alter function public.is_verified() set schema private;
alter function public.is_admin() set schema private;
alter function public.handle_new_user() set schema private;
alter function public.unlock_completed_gateway_sections() set schema private;

grant execute on function private.is_verified() to authenticated;
grant execute on function private.is_admin() to authenticated;

drop policy "verified read profiles" on public.profiles;
drop policy "verified read sections" on public.sections;
drop policy "verified read tiles" on public.tiles;
drop policy "verified read gateways" on public.tile_gateways;
drop policy "verified read contributors" on public.tile_contributors;
drop policy "admins update sections" on public.sections;
drop policy "admins update tiles" on public.tiles;
drop policy "admins add gateways" on public.tile_gateways;
drop policy "admins remove gateways" on public.tile_gateways;
drop policy "members add self" on public.tile_contributors;
drop policy "members edit self" on public.tile_contributors;
drop policy "members remove self" on public.tile_contributors;

create policy "verified read profiles" on public.profiles for select to authenticated using((select private.is_verified()));
create policy "verified read sections" on public.sections for select to authenticated using((select private.is_verified()));
create policy "verified read tiles" on public.tiles for select to authenticated using((select private.is_verified()));
create policy "verified read gateways" on public.tile_gateways for select to authenticated using((select private.is_verified()));
create policy "verified read contributors" on public.tile_contributors for select to authenticated using((select private.is_verified()));
create policy "admins update sections" on public.sections for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create policy "admins update tiles" on public.tiles for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
create policy "admins add gateways" on public.tile_gateways for insert to authenticated with check((select private.is_admin()));
create policy "admins remove gateways" on public.tile_gateways for delete to authenticated using((select private.is_admin()));
create policy "members add self" on public.tile_contributors for insert to authenticated with check((select private.is_verified()) and profile_id=(select auth.uid()));
create policy "members edit self" on public.tile_contributors for update to authenticated using((select private.is_verified()) and profile_id=(select auth.uid())) with check((select private.is_verified()) and profile_id=(select auth.uid()));
create policy "members remove self" on public.tile_contributors for delete to authenticated using((select private.is_verified()) and profile_id=(select auth.uid()));

grant select on public.profiles, public.sections, public.tiles, public.tile_gateways, public.tile_contributors to authenticated;
grant update on public.sections, public.tiles to authenticated;
grant insert, delete on public.tile_gateways to authenticated;
grant insert, update, delete on public.tile_contributors to authenticated;

create index tile_contributors_profile_idx on public.tile_contributors(profile_id);
