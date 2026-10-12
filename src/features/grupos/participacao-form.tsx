"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { addPessoaAoGrupo } from "@/features/grupos/actions";
import type { GrupoOption, PessoaOption } from "@/features/grupos/queries";

type ParticipacaoFormProps = {
  grupos: GrupoOption[];
  pessoas: PessoaOption[];
};

const tiposVoz = [
  "Soprano",
  "Contralto",
  "Tenor",
  "Baixo",
  "Back vocal",
  "Ministro"
];

const tipoLabels: Record<string, string> = {
  LOUVOR: "Banda",
  ORQUESTRA: "Orquestra",
  MINISTERIO: "Som",
  OUTRO: "Obreiros",
  CORAL: "Coral"
};

const funcoesPorCategoria: Record<string, string[]> = {
  Banda: [
    "Ministro de Louvor",
    "Vocalista / Cantor(a)",
    "Back Vocal",
    "Músico / Instrumentista",
    "Líder da Banda",
    "Vice-Líder da Banda",
    "Apoio"
  ],
  Orquestra: [
    "Maestro / Regente",
    "Spalla",
    "Músico / Instrumentista",
    "Líder da Orquestra",
    "Vice-Líder da Orquestra",
    "Arquivista / Partituras",
    "Apoio"
  ],
  Som: [
    "Operador de Som / Sonoplasta",
    "Projeção / Multimídia",
    "Iluminação",
    "Transmissão / Live",
    "Fotografia / Vídeo",
    "Líder de Mídia e Som",
    "Apoio Técnico"
  ],
  Obreiros: [
    "Pastor(a)",
    "Presbítero",
    "Diácono / Diaconisa",
    "Cooperador(a) / Obreiro(a)",
    "Dirigente de Culto",
    "Porteiro(a) / Recepção",
    "Intercessão",
    "Apoio / Zeladoria"
  ],
  Coral: [
    "Coralista",
    "Regente",
    "Preparador(a) Vocal",
    "Pianista / Tecladista",
    "Líder do Coral",
    "Vice-Líder do Coral",
    "Apoio"
  ]
};

const funcoesPadrao = [
  "Líder",
  "Vice-Líder",
  "Membro",
  "Apoio"
];

const tiposVozPorCategoria: Record<string, string[]> = {
  Banda: [
    "Ministro de Louvor",
    "Vocalista",
    "Back vocal",
    "Soprano",
    "Contralto",
    "Tenor",
    "Baixo"
  ],
  Coral: [
    "Soprano",
    "Contralto",
    "Tenor",
    "Baixo"
  ]
};

const instrumentosPorCategoria: Record<string, string[]> = {
  Banda: [
    "Violão",
    "Guitarra",
    "Baixo",
    "Teclado",
    "Piano",
    "Bateria",
    "Percussão",
    "Saxofone Alto",
    "Saxofone Tenor",
    "Saxofone Soprano",
    "Outro"
  ],
  Orquestra: [
    "Violino",
    "Viola",
    "Violoncelo",
    "Contrabaixo Acústico",
    "Flauta Transversal",
    "Clarinete",
    "Saxofone Alto",
    "Saxofone Tenor",
    "Saxofone Soprano",
    "Trompete",
    "Trombone",
    "Tuba",
    "Piano",
    "Percussão / Tímpanos",
    "Outro"
  ],
  Coral: [
    "Piano",
    "Teclado",
    "Outro"
  ]
};

const instrumentosComuns = [
  "Bateria",
  "Baixo",
  "Guitarra",
  "Teclado",
  "Piano",
  "Violão",
  "Saxofone Alto",
  "Saxofone Tenor",
  "Saxofone Soprano",
  "Trompete",
  "Trombone",
  "Tuba",
  "Flauta Transversal",
  "Clarinete",
  "Violino",
  "Viola",
  "Violoncelo",
  "Percussão"
];

const ordemCategorias = ["Banda", "Orquestra", "Som", "Obreiros", "Coral"];

function getCategoriaGrupo(grupo: { nome: string; tipo: string }) {
  const nomeLower = grupo.nome.toLowerCase();
  if (nomeLower.includes("diacon") || nomeLower.includes("obreir")) return "Obreiros";
  if (nomeLower.includes("som") || nomeLower.includes("audio") || nomeLower.includes("audiovisual")) return "Som";
  if (nomeLower.includes("banda") || grupo.tipo === "LOUVOR") return "Banda";
  if (nomeLower.includes("orquestra") || grupo.tipo === "ORQUESTRA") return "Orquestra";
  if (nomeLower.includes("coral") || grupo.tipo === "CORAL") return "Coral";
  return tipoLabels[grupo.tipo] ?? grupo.nome;
}

export function ParticipacaoForm({ grupos, pessoas }: ParticipacaoFormProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const gruposOrdenados = useMemo(() => {
    return [...grupos].sort((a, b) => {
      const idxA = ordemCategorias.indexOf(getCategoriaGrupo(a));
      const idxB = ordemCategorias.indexOf(getCategoriaGrupo(b));
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [grupos]);

  const selectedGroup = useMemo(
    () => grupos.find((grupo) => grupo.id === selectedGroupId) ?? null,
    [grupos, selectedGroupId]
  );

  const categoria = selectedGroup ? getCategoriaGrupo(selectedGroup) : "";
  const funcoesDisponiveis = categoria
    ? (funcoesPorCategoria[categoria] ?? funcoesPadrao)
    : [];

  const hasBanda = categoria === "Banda";
  const hasOrquestra = categoria === "Orquestra";
  const hasCoral = categoria === "Coral";
  const showVoz = hasBanda || hasCoral;
  const showInstrumento = hasBanda || hasOrquestra;
  const showNivel = hasBanda || hasOrquestra || hasCoral;

  return (
    <form className="form-grid" action={addPessoaAoGrupo}>
      <div className="field">
        <label htmlFor="pessoa_id">Pessoa</label>
        <select className="input" id="pessoa_id" name="pessoa_id" required>
          <option value="">Selecione a pessoa</option>
          {pessoas.map((pessoa) => (
            <option key={pessoa.id} value={pessoa.id}>
              {pessoa.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="grupo_id">Categoria / Grupo</label>
        <select
          className="input"
          id="grupo_id"
          name="grupo_ids"
          onChange={(event) => setSelectedGroupId(event.target.value)}
          required
          value={selectedGroupId}
        >
          <option value="">Selecione o grupo</option>
          {gruposOrdenados.map((grupo) => (
            <option key={grupo.id} value={grupo.id}>
              {getCategoriaGrupo(grupo)}
            </option>
          ))}
        </select>
      </div>

      {categoria ? (
        <div className="field">
          <label htmlFor="funcao">Função</label>
          <select
            className="input"
            id="funcao"
            key={`funcao-${categoria}`}
            name="funcao"
            required
          >
            <option value="">Selecione a função</option>
            {funcoesDisponiveis.map((funcao) => (
              <option key={funcao} value={funcao}>
                {funcao}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {showVoz ? (
        <div className="field">
          <label htmlFor="tipo_voz">
            {hasCoral ? "Tipo de voz (Naipe)" : "Tipo de voz"}
          </label>
          <select
            className="input"
            id="tipo_voz"
            key={`voz-${categoria}`}
            name="tipo_voz"
          >
            <option value="">Selecione o tipo de voz</option>
            {(tiposVozPorCategoria[categoria] ?? tiposVoz).map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {showInstrumento ? (
        <div className="field">
          <label htmlFor="instrumento">Instrumento</label>
          <select
            className="input"
            id="instrumento"
            key={`instrumento-${categoria}`}
            name="instrumento"
          >
            <option value="">Selecione o instrumento</option>
            {(instrumentosPorCategoria[categoria] ?? instrumentosComuns).map((instrumento) => (
              <option key={instrumento} value={instrumento}>
                {instrumento}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {showNivel ? (
        <div className="field">
          <label htmlFor="nivel">Nível</label>
          <select
            className="input"
            id="nivel"
            key={`nivel-${categoria}`}
            name="nivel"
          >
            <option value="">Selecione o nível</option>
            <option value="INICIANTE">Iniciante</option>
            <option value="INTERMEDIARIO">Intermediário</option>
            <option value="AVANCADO">Avançado</option>
          </select>
        </div>
      ) : null}

      <div className="field full">
        <label htmlFor="observacoes">Observações</label>
        <textarea className="input textarea small" id="observacoes" name="observacoes" />
      </div>

      <div className="form-actions">
        <button className="button" disabled={!selectedGroupId} type="submit">
          <Plus size={18} />
          Adicionar ao grupo
        </button>
      </div>
    </form>
  );
}
