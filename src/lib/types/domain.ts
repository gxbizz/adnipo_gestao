export type PessoaStatus = "ATIVO" | "INATIVO";
export type GrupoTipo = "LOUVOR" | "ORQUESTRA" | "MINISTERIO" | "CORAL" | "OUTRO";
export type GrupoStatus = "ATIVO" | "INATIVO";
export type MembroStatus = "ATIVO" | "INATIVO";
export type PerfilAcesso = "ADMIN" | "LIDER" | "MEMBRO";
export type NivelInstrumento = "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
export type EventoStatus = "AGENDADO" | "CANCELADO" | "CONCLUIDO";
export type ConfirmacaoStatus = "PENDENTE" | "CONFIRMADO" | "RECUSADO";

export type PessoaComGrupos = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  status: PessoaStatus;
  grupos: Array<{
    id: string;
    nome: string;
    tipo: GrupoTipo;
    funcao: string | null;
  }>;
};
