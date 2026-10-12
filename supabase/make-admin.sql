-- Use este script depois de criar seu usuário em Authentication > Users.
-- Troque o e-mail abaixo pelo e-mail usado no login do sistema.

insert into public.perfis_usuario (user_id, perfil)
select id, 'ADMIN'
from auth.users
where email = 'seu-email@exemplo.com'
on conflict (user_id)
do update set perfil = 'ADMIN';

-- Conferência: deve retornar seu usuário com perfil ADMIN.
select
  u.email,
  p.perfil,
  p.created_at
from public.perfis_usuario p
join auth.users u on u.id = p.user_id
where u.email = 'seu-email@exemplo.com';
