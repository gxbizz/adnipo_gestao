"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readSheet } from "read-excel-file/node";
import { createClient } from "@/lib/supabase/server";

const tiposLouvor = [
  "Adoração",
  "Celebração",
  "Fé"
] as const;

function textOrNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

function normalizeLouvorName(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function normalizeText(value: unknown) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeDate(value: unknown) {
  if (!value) {
    return null;
  }

  if (value instanceof globalThis.Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  return null;
}

function normalizeTipo(value: unknown) {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  const tipo = tiposLouvor.find(
    (item) => normalizeLouvorName(item) === normalizeLouvorName(text)
  );

  return tipo ?? text;
}

function redirectWithError(message: string): never {
  redirect(`/louvores?error=${encodeURIComponent(message)}`);
}

async function upsertLouvor(params: {
  nome: string;
  tipo_louvor: string | null;
  link_cifra: string | null;
  link_letra: string | null;
  tom: string | null;
  data_culto: string | null;
}) {
  const supabase = await createClient();
  const nomeNormalizado = normalizeLouvorName(params.nome);

  const { data: louvor, error: louvorError } = await supabase
    .from("louvores")
    .upsert(
      {
        nome: params.nome,
        nome_normalizado: nomeNormalizado,
        tipo_louvor: params.tipo_louvor,
        link_cifra: params.link_cifra,
        link_letra: params.link_letra,
        tom: params.tom
      },
      { onConflict: "nome_normalizado" }
    )
    .select("id")
    .single();

  if (louvorError) {
    throw new Error(louvorError.message);
  }

  if (!louvor) {
    throw new Error("Nao foi possivel criar ou localizar o louvor.");
  }

  if (params.data_culto) {
    const { error: execucaoError } = await supabase.from("louvor_execucoes").upsert(
      {
        louvor_id: louvor.id,
        data_culto: params.data_culto,
        tom: params.tom
      },
      { onConflict: "louvor_id,data_culto" }
    );

    if (execucaoError) {
      throw new Error(execucaoError.message);
    }
  }
}

export async function createLouvor(formData: FormData) {
  const nome = textOrNull(formData.get("nome"));

  if (!nome) {
    redirectWithError("Informe o nome do louvor.");
  }

  try {
    await upsertLouvor({
      nome,
      tipo_louvor: normalizeTipo(formData.get("tipo_louvor")),
      link_cifra: textOrNull(formData.get("link_cifra")),
      link_letra: textOrNull(formData.get("link_letra")),
      tom: textOrNull(formData.get("tom")),
      data_culto: textOrNull(formData.get("data_culto"))
    });

    revalidatePath("/louvores");
    redirect("/louvores?success=Louvor%20registrado%20com%20sucesso.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    redirectWithError(error instanceof Error ? error.message : "Falha ao salvar louvor.");
  }
}

export async function importLouvoresFromExcel(formData: FormData) {
  try {
    const file = formData.get("arquivo");

    if (!(file instanceof File) || file.size === 0) {
      redirectWithError("Selecione um arquivo Excel.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = await readSheet(buffer);
    const [headerRow, ...dataRows] = rows;

    if (!headerRow) {
      redirectWithError("A planilha esta vazia.");
    }

    const headers = headerRow.map(normalizeHeader);
    const nomeIndex = headers.indexOf("nome_do_louvor");

    if (nomeIndex === -1) {
      redirectWithError("A planilha precisa ter a coluna nome do louvor.");
    }

    const getValue = (row: unknown[], column: string) => {
      const index = headers.indexOf(column);
      return index >= 0 ? row[index] : null;
    };

    const louvores = dataRows
      .map((row) => ({
        nome: normalizeText(row[nomeIndex]),
        tipo_louvor: normalizeTipo(getValue(row, "tipo_de_louvor")),
        link_cifra: normalizeText(getValue(row, "link_da_cifra")),
        link_letra: normalizeText(getValue(row, "link_da_letra")),
        tom: normalizeText(getValue(row, "tom")),
        data_culto: normalizeDate(getValue(row, "data_do_culto"))
      }))
      .filter((louvor) => louvor.nome);

    if (louvores.length === 0) {
      redirectWithError("Nenhuma linha com nome do louvor foi encontrada.");
    }

    for (const louvor of louvores) {
      await upsertLouvor({
        nome: louvor.nome ?? "",
        tipo_louvor: louvor.tipo_louvor,
        link_cifra: louvor.link_cifra,
        link_letra: louvor.link_letra,
        tom: louvor.tom,
        data_culto: louvor.data_culto
      });
    }

    revalidatePath("/louvores");
    redirect(
      `/louvores?success=${encodeURIComponent(`${louvores.length} registro(s) importado(s).`)}`
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    redirectWithError(error instanceof Error ? error.message : "Falha ao importar planilha.");
  }
}
