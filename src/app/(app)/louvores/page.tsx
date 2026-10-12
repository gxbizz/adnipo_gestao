import { Music2, Search, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { createLouvor, importLouvoresFromExcel } from "@/features/louvores/actions";
import { getLatestLouvoresCulto, listLouvores } from "@/features/louvores/queries";
import { WhatsAppShareButton } from "@/features/louvores/whatsapp-share-button";

type LouvoresPageProps = {
  searchParams: Promise<{
    q?: string;
    error?: string;
    success?: string;
  }>;
};

const tiposLouvor = [
  "Adoração",
  "Celebração",
  "Fé"
];

const tonsMusicais = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  "Cm", "C#m", "Dbm", "Dm", "D#m", "Ebm", "Em", "Fm", "F#m", "Gbm", "Gm", "G#m", "Abm", "Am", "A#m", "Bbm", "Bm"
];

function formatDate(date: string | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(date));
}

export default async function LouvoresPage({ searchParams }: LouvoresPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const [
    { data: louvores, error },
    { dataCulto: latestDataCulto, louvores: latestLouvores }
  ] = await Promise.all([
    listLouvores(search),
    getLatestLouvoresCulto()
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Louvores"
        title="Banco de louvores"
        description="Cadastre louvores uma única vez e registre cada culto em que foram cantados para acompanhar frequência e repetição."
      />

      {params.error ? <div className="alert">{params.error}</div> : null}
      {params.success ? <div className="alert success">{params.success}</div> : null}

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "1.25rem",
        padding: "14px 18px",
        background: "var(--panel)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--line)"
      }}>
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>
            Escala mais recente
          </span>
          <h3 style={{ margin: "2px 0 0", fontSize: "1rem", fontWeight: "bold" }}>
            {latestDataCulto ? `Culto de ${formatDate(latestDataCulto)}` : "Sem culto recente"}
            {latestLouvores.length > 0 ? ` · ${latestLouvores.length} louvor(es)` : ""}
          </h3>
        </div>
        <WhatsAppShareButton dataCulto={latestDataCulto} louvores={latestLouvores} />
      </div>

      <section className="panel data-panel">
        <form className="toolbar" action="/louvores">
          <label className="search-field" aria-label="Pesquisar louvor">
            <span>
              <Search size={18} />
              <input
                defaultValue={search}
                name="q"
                placeholder="Pesquisar por nome do louvor"
                type="search"
              />
            </span>
          </label>
          <button className="button secondary" type="submit">
            Pesquisar
          </button>
        </form>

        {error ? <div className="alert">Não foi possível carregar louvores: {error}</div> : null}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome do louvor</th>
                <th>Tipo</th>
                <th>Tom</th>
                <th>Frequência</th>
                <th>Último culto</th>
                <th>Cifra</th>
                <th>Letra</th>
              </tr>
            </thead>
            <tbody>
              {louvores.map((louvor) => (
                <tr key={louvor.id}>
                  <td>
                    <strong>{louvor.nome}</strong>
                  </td>
                  <td>{louvor.tipo_louvor ?? "-"}</td>
                  <td>{louvor.tom ?? "-"}</td>
                  <td>
                    <span className="badge">{louvor.frequencia}x</span>
                  </td>
                  <td>{formatDate(louvor.ultimo_culto)}</td>
                  <td>
                    {louvor.link_cifra ? (
                      <a className="table-link" href={louvor.link_cifra} rel="noreferrer" target="_blank">
                        Abrir
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {louvor.link_letra ? (
                      <a className="table-link" href={louvor.link_letra} rel="noreferrer" target="_blank">
                        Abrir
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
              {louvores.length === 0 ? (
                <tr>
                  <td colSpan={7}>Nenhum louvor encontrado.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <details className="panel form-panel collapsible-panel">
        <summary>
          <p className="eyebrow">Importação</p>
          <h2 className="section-title">Importar louvores por Excel</h2>
        </summary>
        <div>
          <p className="page-description compact">
            Use as colunas: nome do louvor, link da cifra, link da letra, tom, data do culto e tipo de louvor.
          </p>
        </div>
        <form className="import-form" action={importLouvoresFromExcel}>
          <input accept=".xlsx" className="file-input" name="arquivo" required type="file" />
          <button className="button" type="submit">
            <Upload size={18} />
            Importar Excel
          </button>
        </form>
      </details>

      <details className="panel form-panel collapsible-panel" open>
        <summary>
          <p className="eyebrow">Registro</p>
          <h2 className="section-title">Adicionar louvor ou culto</h2>
        </summary>
        <form className="form-grid" action={createLouvor}>
          <div className="field">
            <label htmlFor="nome">Nome do louvor</label>
            <input className="input" id="nome" name="nome" required />
          </div>
          <div className="field">
            <label htmlFor="tipo_louvor">Tipo de louvor</label>
            <select className="input" id="tipo_louvor" name="tipo_louvor">
              <option value="">Selecione</option>
              {tiposLouvor.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="tom">Tom</label>
            <select className="input" id="tom" name="tom">
              <option value="">Selecione o tom</option>
              {tonsMusicais.map((tom) => (
                <option key={tom} value={tom}>
                  {tom}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="data_culto">Data do culto</label>
            <input className="input" id="data_culto" name="data_culto" type="date" />
          </div>
          <div className="field">
            <label htmlFor="link_cifra">Link da cifra</label>
            <input className="input" id="link_cifra" name="link_cifra" type="url" />
          </div>
          <div className="field">
            <label htmlFor="link_letra">Link da letra</label>
            <input className="input" id="link_letra" name="link_letra" type="url" />
          </div>
          <div className="form-actions">
            <button className="button" type="submit">
              <Music2 size={18} />
              Salvar louvor
            </button>
          </div>
        </form>
      </details>
    </>
  );
}
