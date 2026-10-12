create extension if not exists pgcrypto;

create type public.pessoa_status as enum ('ATIVO', 'INATIVO');
create type public.grupo_tipo as enum ('LOUVOR', 'ORQUESTRA', 'MINISTERIO', 'CORAL', 'OUTRO');
create type public.grupo_status as enum ('ATIVO', 'INATIVO');
create type public.membro_status as enum ('ATIVO', 'INATIVO');
create type public.nivel_instrumento as enum ('INICIANTE', 'INTERMEDIARIO', 'AVANCADO');
create type public.evento_status as enum ('AGENDADO', 'CANCELADO', 'CONCLUIDO');
create type public.confirmacao_status as enum ('PENDENTE', 'CONFIRMADO', 'RECUSADO');
create type public.perfil_acesso as enum ('ADMIN', 'LIDER', 'MEMBRO');

create table public.pessoas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  email text,
  data_nascimento date,
  status public.pessoa_status not null default 'ATIVO',
  observacoes text,
  created_at timestamptz not null default now()
);

create table public.grupos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo public.grupo_tipo not null default 'OUTRO',
  descricao text,
  responsavel_id uuid references public.pessoas(id) on delete set null,
  status public.grupo_status not null default 'ATIVO',
  created_at timestamptz not null default now()
);

create table public.grupo_membros (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  grupo_id uuid not null references public.grupos(id) on delete cascade,
  funcao text,
  data_entrada date default current_date,
  status public.membro_status not null default 'ATIVO',
  unique (pessoa_id, grupo_id)
);

create table public.instrumentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  categoria text
);

create table public.membro_instrumentos (
  id uuid primary key default gen_random_uuid(),
  grupo_membro_id uuid not null references public.grupo_membros(id) on delete cascade,
  instrumento_id uuid not null references public.instrumentos(id) on delete restrict,
  nivel public.nivel_instrumento,
  principal boolean not null default false,
  unique (grupo_membro_id, instrumento_id)
);

create table public.grupo_membro_louvor (
  grupo_membro_id uuid primary key references public.grupo_membros(id) on delete cascade,
  campo text,
  tipo_voz text,
  cifra boolean not null default false,
  letra boolean not null default false,
  voz_formada boolean not null default false,
  voz_em_formacao boolean not null default false,
  observacoes text
);

create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  data_hora timestamptz not null,
  tipo text,
  local text,
  status public.evento_status not null default 'AGENDADO'
);

create table public.escalas (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  grupo_id uuid not null references public.grupos(id) on delete cascade,
  unique (evento_id, grupo_id)
);

create table public.escala_membros (
  id uuid primary key default gen_random_uuid(),
  escala_id uuid not null references public.escalas(id) on delete cascade,
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  funcao text,
  instrumento_id uuid references public.instrumentos(id) on delete set null,
  status_confirmacao public.confirmacao_status not null default 'PENDENTE'
);

create table public.louvores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nome_normalizado text not null unique,
  tipo_louvor text,
  link_cifra text,
  link_letra text,
  tom text,
  created_at timestamptz not null default now()
);

create table public.louvor_execucoes (
  id uuid primary key default gen_random_uuid(),
  louvor_id uuid not null references public.louvores(id) on delete cascade,
  data_culto date not null,
  tom text,
  observacoes text,
  created_at timestamptz not null default now(),
  unique (louvor_id, data_culto)
);

create table public.escala_louvores (
  id uuid primary key default gen_random_uuid(),
  escala_id uuid not null references public.escalas(id) on delete cascade,
  louvor_id uuid not null references public.louvores(id) on delete restrict,
  tom text,
  ordem integer,
  observacoes text,
  unique (escala_id, louvor_id)
);

create table public.escala_louvor_pessoas (
  id uuid primary key default gen_random_uuid(),
  escala_louvor_id uuid not null references public.escala_louvores(id) on delete cascade,
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  funcao text,
  unique (escala_louvor_id, pessoa_id)
);

create table public.perfis_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  pessoa_id uuid references public.pessoas(id) on delete set null,
  perfil public.perfil_acesso not null default 'MEMBRO',
  created_at timestamptz not null default now()
);

create index pessoas_nome_idx on public.pessoas using gin (to_tsvector('portuguese', nome));
create index grupos_responsavel_id_idx on public.grupos (responsavel_id);
create index grupo_membros_pessoa_id_idx on public.grupo_membros (pessoa_id);
create index grupo_membros_grupo_id_idx on public.grupo_membros (grupo_id);
create index membro_instrumentos_grupo_membro_id_idx on public.membro_instrumentos (grupo_membro_id);
create index eventos_data_hora_idx on public.eventos (data_hora);
create index escalas_evento_id_idx on public.escalas (evento_id);
create index escala_membros_escala_id_idx on public.escala_membros (escala_id);
create index escala_membros_pessoa_id_idx on public.escala_membros (pessoa_id);
create index louvores_nome_idx on public.louvores using gin (to_tsvector('portuguese', nome));
create index louvor_execucoes_louvor_id_idx on public.louvor_execucoes (louvor_id);
create index louvor_execucoes_data_culto_idx on public.louvor_execucoes (data_culto);
create index escala_louvores_escala_id_idx on public.escala_louvores (escala_id);
create index escala_louvor_pessoas_pessoa_id_idx on public.escala_louvor_pessoas (pessoa_id);
create unique index escala_membros_unicos_idx
on public.escala_membros (
  escala_id,
  pessoa_id,
  coalesce(instrumento_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

create or replace function public.usuario_e_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.perfis_usuario
    where user_id = auth.uid()
      and perfil = 'ADMIN'
  );
$$;

create or replace function public.usuario_lidera_grupo(grupo_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.perfis_usuario pu
    join public.grupos g on g.responsavel_id = pu.pessoa_id
    where pu.user_id = auth.uid()
      and pu.perfil in ('ADMIN', 'LIDER')
      and g.id = grupo_uuid
  );
$$;

alter table public.pessoas enable row level security;
alter table public.grupos enable row level security;
alter table public.grupo_membros enable row level security;
alter table public.instrumentos enable row level security;
alter table public.membro_instrumentos enable row level security;
alter table public.grupo_membro_louvor enable row level security;
alter table public.eventos enable row level security;
alter table public.escalas enable row level security;
alter table public.escala_membros enable row level security;
alter table public.louvores enable row level security;
alter table public.louvor_execucoes enable row level security;
alter table public.escala_louvores enable row level security;
alter table public.escala_louvor_pessoas enable row level security;
alter table public.perfis_usuario enable row level security;

create policy "admins gerenciam pessoas"
on public.pessoas for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

create policy "membros visualizam propria pessoa"
on public.pessoas for select
to authenticated
using (
  exists (
    select 1 from public.perfis_usuario
    where user_id = auth.uid()
      and pessoa_id = pessoas.id
  )
);

create policy "admins gerenciam grupos"
on public.grupos for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

create policy "lideres visualizam seus grupos"
on public.grupos for select
to authenticated
using (public.usuario_lidera_grupo(id));

create policy "admins gerenciam participacoes"
on public.grupo_membros for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

create policy "lideres gerenciam membros dos seus grupos"
on public.grupo_membros for all
to authenticated
using (public.usuario_lidera_grupo(grupo_id))
with check (public.usuario_lidera_grupo(grupo_id));

create policy "usuarios autenticados visualizam instrumentos"
on public.instrumentos for select
to authenticated
using (true);

create policy "admins gerenciam instrumentos"
on public.instrumentos for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

create policy "admins gerenciam instrumentos de membros"
on public.membro_instrumentos for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

create policy "lideres gerenciam instrumentos dos seus grupos"
on public.membro_instrumentos for all
to authenticated
using (
  exists (
    select 1 from public.grupo_membros gm
    where gm.id = membro_instrumentos.grupo_membro_id
      and public.usuario_lidera_grupo(gm.grupo_id)
  )
)
with check (
  exists (
    select 1 from public.grupo_membros gm
    where gm.id = membro_instrumentos.grupo_membro_id
      and public.usuario_lidera_grupo(gm.grupo_id)
  )
);

create policy "admins gerenciam detalhes de louvor"
on public.grupo_membro_louvor for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

create policy "lideres gerenciam detalhes de louvor dos seus grupos"
on public.grupo_membro_louvor for all
to authenticated
using (
  exists (
    select 1 from public.grupo_membros gm
    where gm.id = grupo_membro_louvor.grupo_membro_id
      and public.usuario_lidera_grupo(gm.grupo_id)
  )
)
with check (
  exists (
    select 1 from public.grupo_membros gm
    where gm.id = grupo_membro_louvor.grupo_membro_id
      and public.usuario_lidera_grupo(gm.grupo_id)
  )
);

create policy "admins gerenciam eventos"
on public.eventos for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

create policy "usuarios autenticados visualizam eventos"
on public.eventos for select
to authenticated
using (true);

create policy "admins gerenciam escalas"
on public.escalas for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

create policy "lideres gerenciam escalas dos seus grupos"
on public.escalas for all
to authenticated
using (public.usuario_lidera_grupo(grupo_id))
with check (public.usuario_lidera_grupo(grupo_id));

create policy "admins gerenciam membros de escalas"
on public.escala_membros for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());

create policy "membros visualizam suas escalas"
on public.escala_membros for select
to authenticated
using (
  exists (
    select 1 from public.perfis_usuario
    where user_id = auth.uid()
      and pessoa_id = escala_membros.pessoa_id
  )
);

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

create policy "usuarios visualizam proprio perfil"
on public.perfis_usuario for select
to authenticated
using (user_id = auth.uid() or public.usuario_e_admin());

create policy "admins gerenciam perfis"
on public.perfis_usuario for all
to authenticated
using (public.usuario_e_admin())
with check (public.usuario_e_admin());
