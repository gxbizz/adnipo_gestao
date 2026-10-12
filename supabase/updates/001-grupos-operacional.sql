-- Rode este arquivo se o schema inicial ja foi aplicado.
-- Ele adiciona os detalhes especificos do Louvor e garante politicas de RLS.

create table if not exists public.grupo_membro_louvor (
  grupo_membro_id uuid primary key references public.grupo_membros(id) on delete cascade,
  campo text,
  cifra boolean not null default false,
  letra boolean not null default false,
  observacoes text
);

alter table public.grupo_membro_louvor enable row level security;

drop policy if exists "admins gerenciam detalhes de louvor" on public.grupo_membro_louvor;
create policy "admins gerenciam detalhes de louvor"
on public.grupo_membro_louvor for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

drop policy if exists "lideres gerenciam detalhes de louvor dos seus grupos" on public.grupo_membro_louvor;
create policy "lideres gerenciam detalhes de louvor dos seus grupos"
on public.grupo_membro_louvor for all
to authenticated
using (
  exists (
    select 1
    from public.grupo_membros gm
    where gm.id = grupo_membro_louvor.grupo_membro_id
      and public.usuario_lidera_grupo(gm.grupo_id)
  )
)
with check (
  exists (
    select 1
    from public.grupo_membros gm
    where gm.id = grupo_membro_louvor.grupo_membro_id
      and public.usuario_lidera_grupo(gm.grupo_id)
  )
);
