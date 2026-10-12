# ADNIPO Itaquera

Base inicial de um sistema responsivo para gestão de pessoas, grupos, eventos e escalas de uma igreja.

## Stack

- Next.js com App Router
- TypeScript
- Supabase Auth
- Supabase/PostgreSQL
- Row Level Security preparada no schema SQL

## Estrutura

- `src/app`: rotas, layouts e páginas iniciais
- `src/components`: componentes reutilizáveis de interface
- `src/features`: módulos por domínio, começando por autenticação e pessoas
- `src/lib/supabase`: clientes Supabase para browser, server e middleware
- `src/lib/types`: tipos de domínio e tipos alinhados ao banco
- `supabase/schema.sql`: modelo relacional, índices, funções auxiliares e políticas RLS iniciais

## Configuração

1. Copie `.env.example` para `.env.local`.
2. Preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Execute o SQL de `supabase/schema.sql` no editor SQL do Supabase.
4. Crie seu usuário em Authentication > Users.
5. Execute `supabase/make-admin.sql`, trocando `seu-email@exemplo.com` pelo seu e-mail.
6. Instale as dependências e rode:

```bash
npm install
npm run dev
```

Não use service role key no frontend. Qualquer rotina administrativa com service role deve ficar em ambiente seguro de servidor.
