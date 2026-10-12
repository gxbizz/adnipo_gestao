import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { createGrupo } from "@/features/grupos/actions";
import { ParticipacaoForm } from "@/features/grupos/participacao-form";
import { GruposBoard } from "@/features/grupos/grupos-board";
import { listGrupos, listGruposOptions, listPessoasOptions } from "@/features/grupos/queries";
type GruposPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const grupoTipos = [
  { value: "LOUVOR", label: "Banda" },
  { value: "ORQUESTRA", label: "Orquestra" },
  { value: "MINISTERIO", label: "Som" },
  { value: "OUTRO", label: "Obreiros" },
  { value: "CORAL", label: "Coral" }
];

function getCategoriaGrupo(grupo: { nome: string; tipo: string }) {
  const nomeLower = grupo.nome.toLowerCase();
  if (nomeLower.includes("diacon") || nomeLower.includes("obreir")) return "Obreiros";
  if (nomeLower.includes("som") || nomeLower.includes("audio") || nomeLower.includes("audiovisual")) return "Som";
  if (nomeLower.includes("banda") || grupo.tipo === "LOUVOR") return "Banda";
  if (nomeLower.includes("orquestra") || grupo.tipo === "ORQUESTRA") return "Orquestra";
  if (nomeLower.includes("coral") || grupo.tipo === "CORAL") return "Coral";
  return "Obreiros";
}

export default async function GruposPage({ searchParams }: GruposPageProps) {
  const params = await searchParams;
  const [
    { data: grupos, error: gruposError },
    { data: gruposOptions, error: gruposOptionsError },
    { data: pessoas, error: pessoasError }
  ] = await Promise.all([listGrupos(), listGruposOptions(), listPessoasOptions()]);

  return (
    <>
      <PageHeader
        eyebrow="Grupos"
        title="Grupos e Ministérios"
        description="Vincule uma pessoa já cadastrada a um ou mais grupos, mantendo dados específicos por participação."
      />
      {params.error ? <div className="alert">{params.error}</div> : null}
      {params.success ? <div className="alert success">{params.success}</div> : null}
      {gruposError ? <div className="alert">Não foi possível carregar grupos: {gruposError}</div> : null}
      {gruposOptionsError ? (
        <div className="alert">Não foi possível carregar opções de grupos: {gruposOptionsError}</div>
      ) : null}
      {pessoasError ? (
        <div className="alert">Não foi possível carregar pessoas: {pessoasError}</div>
      ) : null}

      <section className="grid group-dashboard">
        {grupoTipos.map((tipo) => {
          const total = grupos
            .filter((grupo) => getCategoriaGrupo(grupo) === tipo.label)
            .reduce((sum, grupo) => sum + grupo.grupo_membros.length, 0);

          return (
            <article className="panel" key={tipo.value}>
              <p className="stat-label">{tipo.label}</p>
              <div className="stat-value">{total}</div>
              <span className="badge">membro(s)</span>
            </article>
          );
        })}
      </section>

      <details className="panel form-panel collapsible-panel">
        <summary>
          <p className="eyebrow">Novo grupo</p>
          <h2 className="section-title">Criar novo grupo</h2>
        </summary>
        <form className="form-grid" action={createGrupo}>
          <div className="field">
            <label htmlFor="nome">Nome do grupo</label>
            <input className="input" id="nome" name="nome" required />
          </div>
          <div className="field">
            <label htmlFor="tipo">Tipo</label>
            <select className="input" id="tipo" name="tipo" required>
              {grupoTipos.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field full">
            <label htmlFor="descricao">Descrição</label>
            <textarea className="input textarea" id="descricao" name="descricao" />
          </div>
          <div className="form-actions">
            <button className="button" type="submit">
              <Plus size={18} />
              Criar grupo
            </button>
          </div>
        </form>
      </details>

      <details className="panel form-panel collapsible-panel" open>
        <summary>
          <p className="eyebrow">Participação</p>
          <h2 className="section-title">Adicionar pessoa a um grupo</h2>
        </summary>
        <ParticipacaoForm grupos={gruposOptions} pessoas={pessoas} />
      </details>

      <GruposBoard grupos={grupos} />
    </>
  );
}
