drop policy "admins update tiles" on public.tiles;

create policy "verified update tiles"
on public.tiles for update to authenticated
using ((select private.is_verified()))
with check ((select private.is_verified()));

revoke update on public.tiles from authenticated;
grant update (status, time_estimate, strategy) on public.tiles to authenticated;

create or replace function private.enforce_tile_update_permissions()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not (select private.is_admin())
     and (
       new.time_estimate is distinct from old.time_estimate
       or new.strategy is distinct from old.strategy
     ) then
    raise exception 'Only admins may edit tile planning notes'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_tile_update_permissions() from public, anon, authenticated;

create trigger enforce_tile_update_permissions
before update on public.tiles
for each row execute function private.enforce_tile_update_permissions();
