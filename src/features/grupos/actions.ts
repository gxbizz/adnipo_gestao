"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const grupoTipos = ["LOUVOR", "ORQUESTRA", "MINISTERIO", "CORAL", "OUTRO"] as const;
const niveis = ["INICIANTE", "INTERMEDIARIO", "AVANCADO"] as const;

function textOrNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function redirectWithError(message: string): never {
  redirect(`/grupos?error=${encodeURIComponent(message)}`);
}

export async function createGrupo(formData: FormData) {
  const nome = textOrNull(formData.get("nome"));
  const tipo = String(formData.get("tipo") ?? "OUTRO");

  if (!nome) {
    redirectWithError("Informe o nome do grupo.");
  }

  if (!grupoTipos.includes(tipo as (typeof grupoTipos)[number])) {
    redirectWithError("Tipo de grupo invalido.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("grupos").insert({
    nome,
    tipo,
    descricao: textOrNull(formData.get("descricao")),
    status: "ATIVO"
  });

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/grupos");
  redirect("/grupos?success=Grupo%20criado%20com%20sucesso.");
}

export async function addPessoaAoGrupo(formData: FormData) {
  const pessoaId = textOrNull(formData.get("pessoa_id"));
  const grupoIds = formData
    .getAll("grupo_ids")
    .map((id) => String(id))
    .filter(Boolean);

  if (!pessoaId || grupoIds.length === 0) {
    redirectWithError("Selecione uma pessoa e pelo menos um grupo.");
  }

  const supabase = await createClient();
  const { data: grupos, error: grupoError } = await supabase
    .from("grupos")
    .select("id,nome,tipo")
    .in("id", grupoIds);

  if (grupoError) {
    redirectWithError(grupoError.message);
  }

  if (!grupos || grupos.length === 0) {
    redirectWithError("Nenhum grupo valido foi encontrado.");
  }

  let criados = 0;
  let atualizados = 0;

  for (const grupo of grupos) {
    const { data: membroExistente, error: membroExistenteError } = await supabase
      .from("grupo_membros")
      .select("id")
      .eq("pessoa_id", pessoaId)
      .eq("grupo_id", grupo.id)
      .maybeSingle();

    if (membroExistenteError) {
      redirectWithError(membroExistenteError.message);
    }

    const tipoVoz = textOrNull(formData.get("tipo_voz"));
    const funcaoForm = textOrNull(formData.get("funcao"));
    const funcao = funcaoForm ?? (grupo.tipo === "LOUVOR" ? tipoVoz : null);
    let membro = membroExistente;

    if (membro) {
      const { error: updateMembroError } = await supabase
        .from("grupo_membros")
        .update({
          funcao,
          status: "ATIVO"
        })
        .eq("id", membro.id);

      if (updateMembroError) {
        redirectWithError(updateMembroError.message);
      }

      atualizados += 1;
    } else {
      const { data: novoMembro, error: membroError } = await supabase
        .from("grupo_membros")
        .insert({
          pessoa_id: pessoaId,
          grupo_id: grupo.id,
          funcao,
          status: "ATIVO"
        })
        .select("id")
        .single();

      if (membroError) {
        redirectWithError(membroError.message);
      }

      membro = novoMembro;
      criados += 1;
    }

    if (!membro) {
      redirectWithError("Nao foi possivel criar ou atualizar a participacao no grupo.");
    }

    const aceitaInstrumento = grupo.tipo === "ORQUESTRA" || grupo.tipo === "LOUVOR" || grupo.tipo === "CORAL";
    let instrumentoNome = aceitaInstrumento ? textOrNull(formData.get("instrumento")) : null;
    const nivel = String(formData.get("nivel") ?? "");
    const nivelValido = niveis.includes(nivel as (typeof niveis)[number])
      ? (nivel as (typeof niveis)[number])
      : null;

    if (!instrumentoNome && nivelValido) {
      instrumentoNome = tipoVoz ? "Voz" : "Geral";
    }

    if (instrumentoNome) {
      const { data: instrumento, error: instrumentoError } = await supabase
        .from("instrumentos")
        .upsert(
          {
            nome: instrumentoNome,
            categoria: grupo.tipo === "ORQUESTRA" ? "Orquestra" : "Musical"
          },
          { onConflict: "nome" }
        )
        .select("id")
        .single();

      if (instrumentoError) {
        redirectWithError(instrumentoError.message);
      }

      if (!instrumento) {
        redirectWithError("Nao foi possivel criar ou localizar o instrumento.");
      }

      const { error: membroInstrumentoError } = await supabase
        .from("membro_instrumentos")
        .upsert(
          {
            grupo_membro_id: membro.id,
            instrumento_id: instrumento.id,
            nivel: nivelValido,
            principal: true
          },
          { onConflict: "grupo_membro_id,instrumento_id" }
        );

      if (membroInstrumentoError) {
        redirectWithError(membroInstrumentoError.message);
      }
    }

    if (grupo.tipo === "LOUVOR" || grupo.tipo === "CORAL") {
      const { error: louvorError } = await supabase
        .from("grupo_membro_louvor")
        .upsert({
          grupo_membro_id: membro.id,
          campo: tipoVoz,
          tipo_voz: tipoVoz,
          cifra: false,
          letra: false,
          voz_formada: false,
          voz_em_formacao: false,
          observacoes: textOrNull(formData.get("observacoes"))
        });

      if (louvorError) {
        redirectWithError(louvorError.message);
      }
    }
  }

  revalidatePath("/grupos");
  redirect(
    `/grupos?success=${encodeURIComponent(
      `${criados} vinculo(s) criado(s) e ${atualizados} atualizado(s).`
    )}`
  );
}

export async function deleteGrupo(formData: FormData) {
  const grupoId = textOrNull(formData.get("grupo_id"));

  if (!grupoId) {
    redirectWithError("Grupo nao informado.");
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("grupos").delete().eq("id", grupoId);

    if (error) {
      redirectWithError(error.message);
    }

    revalidatePath("/grupos");
    redirect("/grupos?success=Grupo%20excluido%20com%20sucesso.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    redirectWithError(error instanceof Error ? error.message : "Falha ao excluir grupo.");
  }
}

export async function renameGrupo(formData: FormData) {
  const grupoId = textOrNull(formData.get("grupo_id"));
  const nome = textOrNull(formData.get("nome"));

  if (!grupoId || !nome) {
    redirectWithError("Informe o novo nome do grupo.");
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("grupos").update({ nome }).eq("id", grupoId);

    if (error) {
      redirectWithError(error.message);
    }

    revalidatePath("/grupos");
    redirect("/grupos?success=Grupo%20renomeado%20com%20sucesso.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    redirectWithError(error instanceof Error ? error.message : "Falha ao renomear grupo.");
  }
}

export async function removePessoaDoGrupo(formData: FormData) {
  const membroId = textOrNull(formData.get("membro_id"));

  if (!membroId) {
    redirectWithError("Membro do grupo nao informado.");
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("grupo_membros").delete().eq("id", membroId);

    if (error) {
      redirectWithError(error.message);
    }

    revalidatePath("/grupos");
    redirect("/grupos?success=Pessoa%20removida%20do%20grupo.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    redirectWithError(error instanceof Error ? error.message : "Falha ao remover pessoa do grupo.");
  }
}
