import { createClient } from "@/lib/supabase/server";

export type LouvorListItem = {
  id: string;
  nome: string;
  nome_normalizado: string;
  tipo_louvor: string | null;
  link_cifra: string | null;
  link_letra: string | null;
  tom: string | null;
  louvor_execucoes: Array<{
    data_culto: string;
    tom: string | null;
  }>;
};

export type LouvorDashboardItem = LouvorListItem & {
  frequencia: number;
  ultimo_culto: string | null;
};

export async function listLouvores(search?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("louvores")
      .select(
        "id,nome,nome_normalizado,tipo_louvor,link_cifra,link_letra,tom,louvor_execucoes(data_culto,tom)"
      )
      .order("nome");

    if (search) {
      query = query.ilike("nome", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: error.message };
    }

    const louvores = ((data ?? []) as LouvorListItem[]).map((louvor) => {
      const datas = louvor.louvor_execucoes
        .map((execucao) => execucao.data_culto)
        .filter(Boolean)
        .sort();

      return {
        ...louvor,
        frequencia: louvor.louvor_execucoes.length,
        ultimo_culto: datas.at(-1) ?? null
      };
    });

    return { data: louvores, error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : "Erro inesperado ao buscar louvores."
    };
  }
}

export type LouvorExecucaoItem = {
  id: string;
  nome: string;
  tipo_louvor: string | null;
  link_cifra: string | null;
  link_letra: string | null;
  tom: string | null;
  observacoes: string | null;
};

export async function getLatestLouvoresCulto(): Promise<{
  dataCulto: string | null;
  louvores: LouvorExecucaoItem[];
}> {
  try {
    const supabase = await createClient();
    const { data: execucoes, error: execError } = await supabase
      .from("louvor_execucoes")
      .select("data_culto")
      .order("data_culto", { ascending: false })
      .limit(1);

    if (execError || !execucoes || execucoes.length === 0) {
      return { dataCulto: null, louvores: [] };
    }

    const dataCulto = execucoes[0].data_culto;

    const { data: execItems, error: itemsError } = await supabase
      .from("louvor_execucoes")
      .select("tom, observacoes, louvores(id, nome, tipo_louvor, link_cifra, link_letra, tom)")
      .eq("data_culto", dataCulto);

    if (itemsError || !execItems) {
      return { dataCulto, louvores: [] };
    }

    const louvores: LouvorExecucaoItem[] = execItems
      .map((item: any) => {
        const l = item.louvores;
        if (!l) return null;
        return {
          id: l.id || "",
          nome: l.nome || "",
          tipo_louvor: l.tipo_louvor || null,
          tom: item.tom || l.tom || null,
          link_cifra: l.link_cifra || null,
          link_letra: l.link_letra || null,
          observacoes: item.observacoes || null
        };
      })
      .filter((item): item is LouvorExecucaoItem => Boolean(item));

    return { dataCulto, louvores };
  } catch {
    return { dataCulto: null, louvores: [] };
  }
}
