import { Plus, Search, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { createPessoa, importPessoasFromExcel } from "@/features/pessoas/actions";
import { PessoasTable } from "@/features/pessoas/pessoas-table";
import { listPessoas } from "@/features/pessoas/queries";
type PessoasPageProps = {
  searchParams: Promise<{
    q?: string;
    error?: string;
    success?: string;
  }>;
};

export default async function PessoasPage({ searchParams }: PessoasPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const { data: pessoas, error } = await listPessoas(search);

  return (
    <>
      <PageHeader
        eyebrow="Pessoas"
        title="Cadastro principal"
        description="Cada pessoa deve existir uma única vez e pode participar de vários grupos."
        
        
      />
      <section className="panel data-panel">
        <form className="toolbar" action="/pessoas">
          <label className="search-field" aria-label="Pesquisar pessoa">
            <span>
              <Search size={18} />
              <input
                defaultValue={search}
                name="q"
                placeholder="Pesquisar por nome"
                type="search"
              />
            </span>
          </label>
          <button className="button secondary" type="submit">
            Pesquisar
          </button>
        </form>
        {error ? (
          <div className="alert">
            Não foi possível carregar pessoas: {error}
          </div>
        ) : null}
        {params.error ? <div className="alert">{params.error}</div> : null}
        {params.success ? <div className="alert success">{params.success}</div> : null}
        <PessoasTable pessoas={pessoas} />
      </section>
      <details className="panel form-panel collapsible-panel">
        <summary>
          <p className="eyebrow">Importação</p>
          <h2 className="section-title">Importar pessoas por Excel</h2>
        </summary>
        <div>
          <p className="page-description compact">
            Use uma planilha com cabeçalhos: nome, telefone, email,
            data_nascimento, status e observacoes.
          </p>
        </div>
        <form className="import-form" action={importPessoasFromExcel}>
          <input
            accept=".xlsx"
            className="file-input"
            name="arquivo"
            required
            type="file"
          />
          <button className="button" type="submit">
            <Upload size={18} />
            Importar Excel
          </button>
        </form>
      </details>
      <details className="panel form-panel collapsible-panel">
        <summary>
          <p className="eyebrow">Novo cadastro</p>
          <h2 className="section-title">Adicionar pessoa</h2>
        </summary>
        <form className="form-grid" action={createPessoa}>
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input className="input" id="nome" name="nome" required />
          </div>
          <div className="field">
            <label htmlFor="telefone">Telefone</label>
            <input className="input" id="telefone" name="telefone" />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input className="input" id="email" name="email" type="email" />
          </div>
          <div className="field">
            <label htmlFor="data_nascimento">Data de nascimento</label>
            <input
              className="input"
              id="data_nascimento"
              name="data_nascimento"
              type="date"
            />
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select className="input" defaultValue="ATIVO" id="status" name="status">
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>
          <div className="field full">
            <label htmlFor="observacoes">Observações</label>
            <textarea className="input textarea" id="observacoes" name="observacoes" />
          </div>
          <div className="form-actions">
            <button className="button" type="submit">
              <Plus size={18} />
              Cadastrar pessoa
            </button>
          </div>
        </form>
      </details>
    </>
  );
}
