import { PageHeader } from "@/components/layout/page-header";

const stats = [
  { label: "Pessoas cadastradas", value: "0" },
  { label: "Grupos ativos", value: "0" },
  { label: "Escalas abertas", value: "0" }
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Visão geral"
        description="Resumo inicial para acompanhar cadastros, grupos, eventos e escalas."
      />
      <section className="grid grid-3">
        {stats.map((item) => (
          <article className="panel" key={item.label}>
            <p className="stat-label">{item.label}</p>
            <div className="stat-value">{item.value}</div>
            <span className="badge">Preparado para Supabase</span>
          </article>
        ))}
      </section>
    </>
  );
}
