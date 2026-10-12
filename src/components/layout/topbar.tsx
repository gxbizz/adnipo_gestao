import { logout } from "@/features/auth/actions";
import { hasSupabaseConfig } from "@/lib/supabase/env";

export function Topbar() {
  const supabaseConfigured = hasSupabaseConfig();

  return (
    <header className="topbar">
      <div>
        <strong>Painel administrativo</strong>
        <p className="stat-label">
          {supabaseConfigured
            ? "Supabase Auth e RLS prontos para uso."
            : "Configure o Supabase para ativar login, logout e permissões."}
        </p>
      </div>
      {supabaseConfigured ? (
        <form action={logout}>
          <button className="button secondary" type="submit">
            Sair
          </button>
        </form>
      ) : (
        <span className="badge">Supabase pendente</span>
      )}
    </header>
  );
}
