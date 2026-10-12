import { PageHeader } from "@/components/layout/page-header";

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Configurações"
        title="Administração do sistema"
        description="Área prevista para perfis de acesso, tipos auxiliares e parâmetros da igreja."
      />
      <section className="panel-muted">
        As permissões devem evoluir usando Supabase Auth, perfis internos e Row Level
        Security.
      </section>
    </>
  );
}
