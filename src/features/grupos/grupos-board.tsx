"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { deleteGrupo, removePessoaDoGrupo, renameGrupo } from "@/features/grupos/actions";
import type { GrupoListItem } from "@/features/grupos/queries";

type GruposBoardProps = {
  grupos: GrupoListItem[];
};

const filtros = [
  { value: "TODOS", label: "Todos" },
  { value: "LOUVOR", label: "Banda" },
  { value: "ORQUESTRA", label: "Orquestra" },
  { value: "MINISTERIO", label: "Som" },
  { value: "OUTRO", label: "Obreiros" },
  { value: "CORAL", label: "Coral" }
];

const tipoLabels: Record<string, string> = {
  LOUVOR: "Banda",
  ORQUESTRA: "Orquestra",
  MINISTERIO: "Som",
  OUTRO: "Obreiros",
  CORAL: "Coral"
};

function getTipoLabel(grupo: { nome: string; tipo: string }) {
  const nomeLower = grupo.nome.toLowerCase();
  if (nomeLower.includes("diacon") || nomeLower.includes("obreir")) return "Obreiros";
  if (nomeLower.includes("som") || nomeLower.includes("audio") || nomeLower.includes("audiovisual")) return "Som";
  if (nomeLower.includes("banda") || grupo.tipo === "LOUVOR") return "Banda";
  if (nomeLower.includes("orquestra") || grupo.tipo === "ORQUESTRA") return "Orquestra";
  if (nomeLower.includes("coral") || grupo.tipo === "CORAL") return "Coral";
  return tipoLabels[grupo.tipo] ?? grupo.tipo;
}

export function GruposBoard({ grupos }: GruposBoardProps) {
  const [tipoAtivo, setTipoAtivo] = useState("TODOS");

  const gruposFiltrados = useMemo(() => {
    return grupos.filter((grupo) => {
      if (tipoAtivo === "TODOS") return true;
      return getTipoLabel(grupo) === (tipoLabels[tipoAtivo] ?? tipoAtivo);
    });
  }, [grupos, tipoAtivo]);

  return (
    <section className="panel form-panel board-panel">
      <div className="board-header">
        <div>
          <p className="eyebrow">Membros</p>
          <h2 className="section-title">Grupos cadastrados</h2>
        </div>
      </div>
      <div className="segmented-control" aria-label="Filtrar grupos por tipo">
        {filtros.map((filtro) => (
          <button
            aria-pressed={tipoAtivo === filtro.value}
            key={filtro.value}
            onClick={() => setTipoAtivo(filtro.value)}
            type="button"
          >
            {filtro.label}
          </button>
        ))}
      </div>
      <div className="group-list scroll-area">
        {gruposFiltrados.length > 0 ? (
          gruposFiltrados.map((grupo) => (
            <details className="group-row" key={grupo.id}>
              <summary>
                <span>
                  <strong>{grupo.nome}</strong>
                  <small>
                    {getTipoLabel(grupo)} · {grupo.grupo_membros.length} membro(s)
                  </small>
                </span>
                <form
                  action={deleteGrupo}
                  className="group-action-form"
                  onClick={(event) => event.stopPropagation()}
                  onSubmit={(event) => {
                    const confirmed = window.confirm(
                      `Deseja excluir o grupo "${grupo.nome}"? Os vínculos de membros deste grupo também serão removidos.`
                    );

                    if (!confirmed) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input name="grupo_id" type="hidden" value={grupo.id} />
                  <button
                    aria-label={`Excluir grupo ${grupo.nome}`}
                    className="button danger compact"
                    type="submit"
                  >
                    <Trash2 size={16} />
                    Excluir grupo
                  </button>
                </form>
              </summary>
              <form
                action={renameGrupo}
                className="rename-form"
                onSubmit={(event) => {
                  const formData = new FormData(event.currentTarget);
                  const nome = String(formData.get("nome") ?? "").trim();

                  if (!nome || nome === grupo.nome) {
                    event.preventDefault();
                  }
                }}
              >
                <input name="grupo_id" type="hidden" value={grupo.id} />
                <input
                  aria-label={`Novo nome para ${grupo.nome}`}
                  className="input"
                  defaultValue={grupo.nome}
                  name="nome"
                />
                <button className="button secondary compact" type="submit">
                  <Pencil size={16} />
                  Renomear
                </button>
              </form>
              <div className="member-list compact">
                {grupo.grupo_membros.length > 0 ? (
                  grupo.grupo_membros.map((membro) => {
                    const nivelLabels: Record<string, string> = {
                      INICIANTE: "Iniciante",
                      INTERMEDIARIO: "Intermediário",
                      AVANCADO: "Avançado"
                    };

                    const instrumentos = membro.membro_instrumentos
                      .map((item) => item.instrumentos?.nome)
                      .filter(Boolean)
                      .filter((nome) => nome !== "Voz" && nome !== "Geral")
                      .join(", ");

                    // Determina o nível (seja por instrumento ou histórico vocal de formação)
                    const instNivel = membro.membro_instrumentos.find((i) => i.nivel)?.nivel;
                    let nivel = instNivel && nivelLabels[instNivel] ? nivelLabels[instNivel] : null;

                    if (!nivel && membro.grupo_membro_louvor) {
                      const raw = (membro.grupo_membro_louvor.tipo_voz ?? "").toLowerCase().trim();
                      if (raw.includes("formada") && !raw.includes("em forma")) {
                        nivel = "Avançado";
                      } else if (raw.includes("em forma") || raw.includes("formacao") || raw.includes("formação") || raw === "voz e") {
                        nivel = "Intermediário";
                      } else if (raw.includes("avancad") || raw.includes("avançad")) {
                        nivel = "Avançado";
                      } else if (raw.includes("intermediar")) {
                        nivel = "Intermediário";
                      } else if (raw.includes("iniciante")) {
                        nivel = "Iniciante";
                      } else if (membro.grupo_membro_louvor.voz_formada) {
                        nivel = "Avançado";
                      } else if (membro.grupo_membro_louvor.voz_em_formacao) {
                        nivel = "Intermediário";
                      }
                    }

                    // Se tiver uma voz específica diferente da função e que não seja o status antigo
                    const rawTipoVoz = membro.grupo_membro_louvor?.tipo_voz;
                    const isStatusVoz = rawTipoVoz
                      ? rawTipoVoz.toLowerCase().includes("formada") ||
                        rawTipoVoz.toLowerCase().includes("formacao") ||
                        rawTipoVoz.toLowerCase().includes("formação") ||
                        rawTipoVoz.toLowerCase() === "voz e"
                      : false;
                    const vozAdicional = rawTipoVoz && !isStatusVoz && rawTipoVoz !== membro.funcao ? rawTipoVoz : null;

                    return (
                      <div className="member-item" key={membro.id}>
                        <div className="member-item-header">
                          <strong>{membro.pessoas?.nome ?? "Pessoa removida"}</strong>
                          <form
                            action={removePessoaDoGrupo}
                            onSubmit={(event) => {
                              const confirmed = window.confirm(
                                `Remover ${membro.pessoas?.nome ?? "esta pessoa"} deste grupo?`
                              );

                              if (!confirmed) {
                                event.preventDefault();
                              }
                            }}
                          >
                            <input name="membro_id" type="hidden" value={membro.id} />
                            <button
                              aria-label={`Remover ${membro.pessoas?.nome ?? "pessoa"} do grupo`}
                              className="icon-button danger small"
                              type="submit"
                            >
                              <X size={14} />
                            </button>
                          </form>
                        </div>
                        <span>{membro.funcao ?? "Sem função definida"}</span>
                        {instrumentos ? <span>Instrumento: {instrumentos}</span> : null}
                        {vozAdicional ? <span>Voz: {vozAdicional}</span> : null}
                        {nivel ? <span>Nível: {nivel}</span> : null}
                      </div>
                    );
                  })
                ) : (
                  <span className="stat-label">Nenhum membro vinculado.</span>
                )}
              </div>
            </details>
          ))
        ) : (
          <div className="panel-muted">Nenhum grupo encontrado.</div>
        )}
      </div>
    </section>
  );
}
