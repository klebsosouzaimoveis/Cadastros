create table if not exists public.pre_venda_cadastros (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  nome_proponente text not null,
  telefone text,
  email text,
  dados jsonb not null,
  created_at timestamptz not null default now()
);

-- Supports an earlier draft schema that used user_id.
alter table public.pre_venda_cadastros
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='pre_venda_cadastros' and column_name='user_id'
  ) then
    execute 'update public.pre_venda_cadastros set owner_id=user_id where owner_id is null';
  end if;
  if exists (select 1 from public.pre_venda_cadastros where owner_id is null) then
    raise exception 'Some existing records have no owner_id. Assign them to the administrator before applying this policy.';
  end if;
end $$;

alter table public.pre_venda_cadastros alter column owner_id set not null;
create index if not exists pre_venda_cadastros_owner_created_idx
  on public.pre_venda_cadastros (owner_id, created_at desc);

alter table public.pre_venda_cadastros enable row level security;

-- Remove any policies from earlier drafts before installing the read-only owner policy.
do $$
declare p record;
begin
  for p in select policyname from pg_policies
    where schemaname='public' and tablename='pre_venda_cadastros'
  loop
    execute format('drop policy if exists %I on public.pre_venda_cadastros', p.policyname);
  end loop;
end $$;

revoke all on public.pre_venda_cadastros from anon, authenticated;
grant select on public.pre_venda_cadastros to authenticated;

create policy pre_venda_cadastros_owner_read
  on public.pre_venda_cadastros
  for select
  to authenticated
  using (owner_id = auth.uid());
