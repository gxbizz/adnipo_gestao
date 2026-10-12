import { createClient } from "@/lib/supabase/server";

export type GrupoListItem = {
  id: string;
  nome: string;
  tipo: "LOUVOR" | "ORQUESTRA" | "MINISTERIO" | "CORAL" | "OUTRO";
  descricao: string | null;
  status: "ATIVO" | "INATIVO";
  grupo_membros: Array<{
    id: string;
    funcao: string | null;
    status: "ATIVO" | "INATIVO";
    pessoas: {
      id: string;
      nome: string;
    } | null;
    membro_instrumentos: Array<{
      principal: boolean;
      nivel: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO" | null;
      instrumentos: {
        nome: string;
      } | null;
    }>;
    grupo_membro_louvor: {
      campo: string | null;
      tipo_voz: string | null;
      cifra: boolean;
      letra: boolean;
      voz_formada: boolean;
      voz_em_formacao: boolean;
      observacoes: string | null;
    } | null;
  }>;
};

export type PessoaOption = {
  id: string;
  nome: string;
};

export type GrupoOption = {
  id: string;
  nome: string;
  tipo: "LOUVOR" | "ORQUESTRA" | "MINISTERIO" | "CORAL" | "OUTRO";
};

const gruposSelect =
  "id,nome,tipo,descricao,status,grupo_membros(id,funcao,status,pessoas(id,nome),membro_instrumentos(principal,nivel,instrumentos(nome)),grupo_membro_louvor(campo,tipo_voz,cifra,letra,voz_formada,voz_em_formacao,observacoes))";

const gruposSelectLegado =
  "id,nome,tipo,descricao,status,grupo_membros(id,funcao,status,pessoas(id,nome),membro_instrumentos(principal,nivel,instrumentos(nome)),grupo_membro_louvor(campo,cifra,letra,observacoes))";

function normalizeGrupos(data: unknown[]) {
  return data.map((grupo) => {
    const item = grupo as Omit<GrupoListItem, "grupo_membros"> & {
      grupo_membros?: Array<
        Omit<GrupoListItem["grupo_membros"][number], "pessoas" | "grupo_membro_louvor"> & {
          pessoas?: GrupoListItem["grupo_membros"][number]["pessoas"][];
          grupo_membro_louvor?: Partial<
            NonNullable<GrupoListItem["grupo_membros"][number]["grupo_membro_louvor"]>
          >[];
        }
      >;
    };

    return {
      ...item,
      grupo_membros: (item.grupo_membros ?? []).map((membro) => {
        const louvor = Array.isArray(membro.grupo_membro_louvor)
          ? membro.grupo_membro_louvor[0] ?? null
          : membro.grupo_membro_louvor;

        return {
          ...membro,
          pessoas: Array.isArray(membro.pessoas) ? membro.pessoas[0] ?? null : membro.pessoas,
          grupo_membro_louvor: louvor
            ? {
                campo: louvor.campo ?? null,
                tipo_voz: louvor.tipo_voz ?? louvor.campo ?? null,
                cifra: louvor.cifra ?? false,
                letra: louvor.letra ?? false,
                voz_formada: louvor.voz_formada ?? false,
                voz_em_formacao: louvor.voz_em_formacao ?? false,
                observacoes: louvor.observacoes ?? null
              }
            : null
        };
      })
    };
  }) as GrupoListItem[];
}

export async function listGrupos() {
  try {
    const supabase = await createClient();
    let { data, error } = await supabase
      .from("grupos")
      .select(gruposSelect)
      .order("nome");

    if (error) {
      const fallback = await supabase.from("grupos").select(gruposSelectLegado).order("nome");
      data = fallback.data;
      error = fallback.error;
    }

    return { data: normalizeGrupos((data ?? []) as unknown[]), error: error?.message ?? null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : "Erro inesperado ao buscar grupos."
    };
  }
}

export async function listGruposOptions() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("grupos")
      .select("id,nome,tipo")
      .eq("status", "ATIVO")
      .order("nome");

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as GrupoOption[], error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : "Erro inesperado ao buscar grupos."
    };
  }
}

export async function listPessoasOptions() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pessoas")
      .select("id,nome")
      .eq("status", "ATIVO")
      .order("nome");

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as PessoaOption[], error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : "Erro inesperado ao buscar pessoas."
    };
  }
}
