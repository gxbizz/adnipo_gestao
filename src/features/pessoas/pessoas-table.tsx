"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { deletePessoas } from "@/features/pessoas/actions";
import type { PessoaListItem } from "@/features/pessoas/queries";

type PessoasTableProps = {
  pessoas: PessoaListItem[];
};

export function PessoasTable({ pessoas }: PessoasTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = pessoas.length > 0 && selectedIds.length === pessoas.length;

  function toggleAll() {
    setSelectedIds(allSelected ? [] : pessoas.map((pessoa) => pessoa.id));
  }

  function togglePessoa(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    );
  }

  function confirmDelete(count: number) {
    return window.confirm(
      count === 1
        ? "Deseja excluir esta pessoa?"
        : `Deseja excluir ${count} pessoas selecionadas?`
    );
  }

  if (pessoas.length === 0) {
    return (
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Status</th>
              <th>Grupos</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6}>Nenhuma pessoa cadastrada ainda.</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="people-table-panel">
      {pessoas.map((pessoa) => (
        <form
          action={deletePessoas}
          className="hidden-form"
          id={`delete-pessoa-${pessoa.id}`}
          key={pessoa.id}
        >
          <input name="ids" type="hidden" value={pessoa.id} />
        </form>
      ))}
      <form
        action={deletePessoas}
        id="delete-pessoas-selecionadas"
        className="hidden-form"
        onSubmit={(event) => {
          if (!confirmDelete(selectedIds.length)) {
            event.preventDefault();
          }
        }}
      />
      <div className="bulk-actions">
        <span>{selectedIds.length} selecionada(s)</span>
        <button
          className="button danger"
          disabled={selectedIds.length === 0}
          form="delete-pessoas-selecionadas"
          type="submit"
        >
          Excluir selecionados
        </button>
      </div>
      {selectedIds.map((id) => (
        <input
          form="delete-pessoas-selecionadas"
          key={id}
          name="ids"
          type="hidden"
          value={id}
        />
      ))}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th className="select-cell">
                <input
                  aria-label="Selecionar todas as pessoas visíveis"
                  checked={allSelected}
                  onChange={toggleAll}
                  type="checkbox"
                />
              </th>
              <th>Nome</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Status</th>
              <th>Grupos</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {pessoas.map((pessoa) => (
              <tr key={pessoa.id}>
                <td className="select-cell">
                  <input
                    aria-label={`Selecionar ${pessoa.nome}`}
                    checked={selectedSet.has(pessoa.id)}
                    onChange={() => togglePessoa(pessoa.id)}
                    type="checkbox"
                  />
                </td>
                <td>{pessoa.nome}</td>
                <td>{pessoa.telefone ?? "-"}</td>
                <td>{pessoa.email ?? "-"}</td>
                <td>
                  <span className="badge">{pessoa.status}</span>
                </td>
                <td>{pessoa.grupo_membros.length}</td>
                <td>
                  <button
                    aria-label={`Excluir ${pessoa.nome}`}
                    className="icon-button danger"
                    form={`delete-pessoa-${pessoa.id}`}
                    onClick={(event) => {
                      if (!confirmDelete(1)) {
                        event.preventDefault();
                      }
                    }}
                    type="submit"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
