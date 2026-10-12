"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readSheet } from "read-excel-file/node";
import { createClient } from "@/lib/supabase/server";

function emptyToNull(value: FormDataEntryValue | null) {
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

function normalizeText(value: unknown) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeStatus(value: unknown) {
  const status = String(value ?? "ATIVO").trim().toUpperCase();
  return status === "INATIVO" ? "INATIVO" : "ATIVO";
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

export async function createPessoa(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();

  if (!nome) {
    redirect("/pessoas?error=Informe%20o%20nome%20da%20pessoa.");
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase.from("pessoas").insert({
      nome,
      telefone: emptyToNull(formData.get("telefone")),
      email: emptyToNull(formData.get("email")),
      data_nascimento: emptyToNull(formData.get("data_nascimento")),
      observacoes: emptyToNull(formData.get("observacoes")),
      status: normalizeStatus(formData.get("status"))
    });

    if (error) {
      redirect(`/pessoas?error=${encodeURIComponent(error.message)}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Falha ao conectar no Supabase.";
    redirect(
      `/pessoas?error=${encodeURIComponent(
        `${message}. Se aparecer fetch failed, reinicie usando npm run dev:insecure.`
      )}`
    );
  }

  revalidatePath("/pessoas");
  redirect("/pessoas?success=Pessoa%20cadastrada%20com%20sucesso.");
}

export async function importPessoasFromExcel(formData: FormData) {
  try {
    const file = formData.get("arquivo");

    if (!(file instanceof File) || file.size === 0) {
      redirect("/pessoas?error=Selecione%20um%20arquivo%20Excel.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = await readSheet(buffer);
    const [headerRow, ...dataRows] = rows;

    if (!headerRow) {
      redirect("/pessoas?error=A%20planilha%20est%C3%A1%20vazia.");
    }

    const headers = headerRow.map(normalizeHeader);
    const nomeIndex = headers.indexOf("nome");

    if (nomeIndex === -1) {
      redirect("/pessoas?error=A%20planilha%20precisa%20ter%20a%20coluna%20nome.");
    }

    const getValue = (row: unknown[], column: string) => {
      const index = headers.indexOf(column);
      return index >= 0 ? row[index] : null;
    };

    const pessoas = dataRows
      .map((row) => ({
        nome: normalizeText(row[nomeIndex]),
        telefone: normalizeText(getValue(row, "telefone")),
        email: normalizeText(getValue(row, "email")),
        data_nascimento: normalizeDate(getValue(row, "data_nascimento")),
        status: normalizeStatus(getValue(row, "status")),
        observacoes: normalizeText(getValue(row, "observacoes"))
      }))
      .filter((pessoa) => pessoa.nome);

    if (pessoas.length === 0) {
      redirect("/pessoas?error=Nenhuma%20linha%20com%20nome%20foi%20encontrada.");
    }

    const supabase = await createClient();
    const { error } = await supabase.from("pessoas").insert(pessoas);

    if (error) {
      redirect(`/pessoas?error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/pessoas");
    redirect(
      `/pessoas?success=${encodeURIComponent(`${pessoas.length} pessoa(s) importada(s) com sucesso.`)}`
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("NEXT_REDIRECT")
        ? null
        : error instanceof Error
          ? error.message
          : "Falha ao importar a planilha.";

    if (!message) {
      throw error;
    }

    redirect(
      `/pessoas?error=${encodeURIComponent(
        `${message}. Se aparecer fetch failed, reinicie usando npm run dev:insecure.`
      )}`
    );
  }
}

export async function deletePessoas(formData: FormData) {
  const ids = formData
    .getAll("ids")
    .map((id) => String(id))
    .filter(Boolean);

  if (ids.length === 0) {
    redirect("/pessoas?error=Selecione%20pelo%20menos%20uma%20pessoa.");
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("pessoas").delete().in("id", ids);

    if (error) {
      redirect(`/pessoas?error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/pessoas");
    redirect(
      `/pessoas?success=${encodeURIComponent(`${ids.length} pessoa(s) excluida(s) com sucesso.`)}`
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Falha ao excluir pessoas.";
    redirect(`/pessoas?error=${encodeURIComponent(message)}`);
  }
}
