-- Banco de louvores e historico de cultos.
-- Rode este arquivo no SQL Editor do Supabase.

create table if not exists public.louvores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nome_normalizado text not null unique,
  tipo_louvor text,
  link_cifra text,
  link_letra text,
  tom text,
  created_at timestamptz not null default now()
);

create table if not exists public.louvor_execucoes (
  id uuid primary key default gen_random_uuid(),
  louvor_id uuid not null references public.louvores(id) on delete cascade,
  data_culto date not null,
  tom text,
  observacoes text,
  created_at timestamptz not null default now(),
  unique (louvor_id, data_culto)
);

create table if not exists public.escala_louvores (
  id uuid primary key default gen_random_uuid(),
  escala_id uuid not null references public.escalas(id) on delete cascade,
  louvor_id uuid not null references public.louvores(id) on delete restrict,
  tom text,
  ordem integer,
  observacoes text,
  unique (escala_id, louvor_id)
);

create table if not exists public.escala_louvor_pessoas (
  id uuid primary key default gen_random_uuid(),
  escala_louvor_id uuid not null references public.escala_louvores(id) on delete cascade,
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  funcao text,
  unique (escala_louvor_id, pessoa_id)
);

create index if not exists louvores_nome_idx
on public.louvores using gin (to_tsvector('portuguese', nome));

create index if not exists louvor_execucoes_louvor_id_idx
on public.louvor_execucoes (louvor_id);

create index if not exists louvor_execucoes_data_culto_idx
on public.louvor_execucoes (data_culto);

create index if not exists escala_louvores_escala_id_idx
on public.escala_louvores (escala_id);

create index if not exists escala_louvor_pessoas_pessoa_id_idx
on public.escala_louvor_pessoas (pessoa_id);

alter table public.louvores enable row level security;
alter table public.louvor_execucoes enable row level security;
alter table public.escala_louvores enable row level security;
alter table public.escala_louvor_pessoas enable row level security;

create policy "usuarios autenticados visualizam louvores"
on public.louvores for select
to authenticated
using (true);

create policy "admins gerenciam louvores"
on public.louvores for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

create policy "usuarios autenticados visualizam execucoes de louvores"
on public.louvor_execucoes for select
to authenticated
using (true);

create policy "admins gerenciam execucoes de louvores"
on public.louvor_execucoes for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

create policy "admins gerenciam louvores de escalas"
on public.escala_louvores for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

create policy "membros visualizam louvores das proprias escalas"
on public.escala_louvores for select
to authenticated
using (
  exists (
    select 1
    from public.escala_membros em
    join public.perfis_usuario pu on pu.pessoa_id = em.pessoa_id
    where em.escala_id = escala_louvores.escala_id
      and pu.user_id = auth.uid()
  )
);

create policy "admins gerenciam cantores por louvor"
on public.escala_louvor_pessoas for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

create policy "membros visualizam proprios louvores escalados"
on public.escala_louvor_pessoas for select
to authenticated
using (
  exists (
    select 1
    from public.perfis_usuario pu
    where pu.user_id = auth.uid()
      and pu.pessoa_id = escala_louvor_pessoas.pessoa_id
  )
);
