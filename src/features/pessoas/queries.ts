import { createClient } from "@/lib/supabase/server";

export type PessoaListItem = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  status: "ATIVO" | "INATIVO";
  grupo_membros: Array<{ id: string }>;
};

export async function listPessoas(search?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("pessoas")
      .select("id,nome,telefone,email,status,grupo_membros(id)")
      .order("nome");

    if (search) {
      query = query.ilike("nome", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return {
        data: [],
        error: error.message
      };
    }

    return {
      data: (data ?? []) as PessoaListItem[],
      error: null
    };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : "Erro inesperado ao buscar pessoas."
    };
  }
}
