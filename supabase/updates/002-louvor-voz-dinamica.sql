-- Rode este arquivo se o schema inicial ja foi aplicado.
-- Ele adiciona campos novos para a participacao em grupos de Louvor.

alter table public.grupo_membro_louvor
  add column if not exists tipo_voz text,
  add column if not exists voz_formada boolean not null default false,
  add column if not exists voz_em_formacao boolean not null default false;
