import Image from "next/image";
import { login } from "@/features/auth/actions";
import { hasSupabaseConfig } from "@/lib/supabase/env";

export default function LoginPage() {
  const supabaseConfigured = hasSupabaseConfig();

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">
          <Image
            alt="Logo da igreja"
            className="auth-logo"
            height={48}
            src="/images/adnipo-logo.jpeg"
            width={48}
          />
          <span>ADNIPO Itaquera</span>
        </div>
        <h1 className="page-title">Acesse sua conta</h1>
        <p className="page-description">
          Use o login do Supabase Auth para acessar o painel administrativo.
        </p>
        {!supabaseConfigured ? (
          <div className="panel-muted">
            Configure o arquivo <strong>.env.local</strong> com a URL e a chave
            anon pública do Supabase antes de usar o login.
          </div>
        ) : null}
        <form className="auth-form" action={login}>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input className="input" id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              className="input"
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          <button className="button" disabled={!supabaseConfigured} type="submit">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
