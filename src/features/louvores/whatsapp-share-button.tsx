"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Plus, RefreshCw, Trash2, X } from "lucide-react";
import type { LouvorExecucaoItem } from "@/features/louvores/queries";

type WhatsAppShareButtonProps = {
  dataCulto: string | null;
  louvores: LouvorExecucaoItem[];
  className?: string;
  buttonLabel?: string;
};

type SongItem = {
  id?: string;
  nome: string;
  observacoes: string;
  link: string;
};

function formatDataLegivel(dataCulto: string | null) {
  if (!dataCulto) return "próximo domingo";
  const [ano, mes, dia] = dataCulto.split("-");
  return `${dia}/${mes}/${ano}`;
}

const defaultExampleSongs: SongItem[] = [
  {
    nome: "Harpa - vencendo em Jesus",
    observacoes: "Esse louvor será tocado enquanto a orquestra desce e o coral se arruma.",
    link: ""
  },
  {
    nome: "Adoração e adoradores - Deus é bom",
    observacoes: "",
    link: "https://youtu.be/5KiQDoWo5t4?is=PAMV5y-zICH7qPg9"
  },
  {
    nome: "Baruk - meu senhor, Jesus Cristo",
    observacoes: "",
    link: "https://youtu.be/Mj2DfdZY-3U?is=--0Cy208NlnG1tot"
  }
];

export function WhatsAppShareButton({
  dataCulto,
  louvores,
  className,
  buttonLabel = "Compartilhar Link em Grupo do WhatsApp"
}: WhatsAppShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");

  const [saudacao, setSaudacao] = useState("Paz gente, segue os louvores de domingo.");
  const [horarioEnsaio, setHorarioEnsaio] = useState("*Vamos ensaiar no sábado às 14h.*");
  const [avisoCoral, setAvisoCoral] = useState("Todos os louvores serão cantados pelo coral.");
  const [reserva, setReserva] = useState("Diante do trono - Deus do impossível");
  const [rodape, setRodape] = useState("@todos");

  // Inicia com os louvores reais da data mais recente, ou os exemplos se a lista estiver vazia
  const initialSongs = useMemo<SongItem[]>(() => {
    if (louvores && louvores.length > 0) {
      return louvores.map((l) => ({
        id: l.id,
        nome: l.nome,
        observacoes:
          l.observacoes ||
          (l.nome.toLowerCase().includes("harpa")
            ? "Esse louvor será tocado enquanto a orquestra desce e o coral se arruma."
            : ""),
        link: l.link_cifra || l.link_letra || ""
      }));
    }
    return defaultExampleSongs;
  }, [louvores]);

  const [songs, setSongs] = useState<SongItem[]>(initialSongs);

  // Mantém sincronizado caso a prop mude
  const handleOpen = () => {
    if (songs.length === 0 && initialSongs.length > 0) {
      setSongs(initialSongs);
    }
    setIsOpen(true);
    setCopied(false);
  };

  const formattedMessage = useMemo(() => {
    const parts: string[] = [];

    const headerLines: string[] = [];
    if (saudacao.trim()) headerLines.push(saudacao.trim());
    if (horarioEnsaio.trim()) headerLines.push(horarioEnsaio.trim());
    if (avisoCoral.trim()) headerLines.push(avisoCoral.trim());

    if (headerLines.length > 0) {
      parts.push(headerLines.join("\n"));
    }

    songs.forEach((song) => {
      if (!song.nome.trim()) return;
      const songLines: string[] = [];
      songLines.push("—————————————————");
      songLines.push(song.nome.trim());

      if (song.observacoes.trim()) {
        songLines.push(song.observacoes.trim());
      }

      if (song.link.trim()) {
        songLines.push("Versão referência:");
        songLines.push(song.link.trim());
      }

      parts.push(songLines.join("\n"));
    });

    if (songs.length > 0) {
      parts.push("_____________________________");
    }

    if (reserva.trim()) {
      parts.push(`Reserva:\n${reserva.trim()}`);
    }

    if (rodape.trim()) {
      parts.push(rodape.trim());
    }

    return parts.join("\n");
  }, [saudacao, horarioEnsaio, avisoCoral, songs, reserva, rodape]);

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedMessage)}`;
    window.open(url, "_blank");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleReset = () => {
    setSaudacao("Paz gente, segue os louvores de domingo.");
    setHorarioEnsaio("*Vamos ensaiar no sábado às 14h.*");
    setAvisoCoral("Todos os louvores serão cantados pelo coral.");
    setReserva("Diante do trono - Deus do impossível");
    setRodape("@todos");
    setSongs(initialSongs);
  };

  const handleSongChange = (index: number, field: keyof SongItem, value: string) => {
    setSongs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddSong = () => {
    setSongs((prev) => [
      ...prev,
      { nome: "", observacoes: "", link: "" }
    ]);
    setActiveTab("edit");
  };

  const handleRemoveSong = (index: number) => {
    setSongs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <button
        className={className || "button whatsapp-share-btn"}
        onClick={handleOpen}
        type="button"
      >
        <WhatsAppIcon size={18} />
        <span>{buttonLabel}</span>
      </button>

      {isOpen ? (
        <div className="wa-modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="wa-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Cabeçalho do Modal */}
            <div className="wa-modal-header">
              <div className="wa-modal-title-area">
                <div className="wa-icon-badge">
                  <WhatsAppIcon size={22} />
                </div>
                <div>
                  <h3 className="wa-modal-title">Compartilhar Louvores no WhatsApp</h3>
                  <p className="wa-modal-subtitle">
                    Culto mais recente: <strong>{formatDataLegivel(dataCulto)}</strong>
                    {louvores.length > 0 ? ` · ${louvores.length} louvor(es) da escala` : ""}
                  </p>
                </div>
              </div>
              <button
                className="icon-button small"
                onClick={() => setIsOpen(false)}
                type="button"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Alternador de Abas */}
            <div className="wa-modal-tabs">
              <button
                className={`wa-tab-btn ${activeTab === "preview" ? "active" : ""}`}
                onClick={() => setActiveTab("preview")}
                type="button"
              >
                👁️ Pré-visualização da mensagem
              </button>
              <button
                className={`wa-tab-btn ${activeTab === "edit" ? "active" : ""}`}
                onClick={() => setActiveTab("edit")}
                type="button"
              >
                ✏️ Personalizar detalhes ({songs.length} louvores)
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="wa-modal-body">
              {activeTab === "preview" ? (
                <div className="wa-preview-container">
                  <div className="wa-chat-bubble">
                    <pre className="wa-message-text">{formattedMessage}</pre>
                    <div className="wa-bubble-time">
                      <span>Agora</span>
                      <Check size={14} className="wa-check-icon" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="wa-edit-container">
                  <div className="wa-form-row">
                    <label>Saudação inicial</label>
                    <input
                      className="input"
                      value={saudacao}
                      onChange={(e) => setSaudacao(e.target.value)}
                      placeholder="Ex: Paz gente, segue os louvores de domingo."
                    />
                  </div>

                  <div className="wa-form-grid-2">
                    <div className="wa-form-row">
                      <label>Horário do Ensaio</label>
                      <input
                        className="input"
                        value={horarioEnsaio}
                        onChange={(e) => setHorarioEnsaio(e.target.value)}
                        placeholder="Ex: *Vamos ensaiar no sábado às 14h.*"
                      />
                    </div>
                    <div className="wa-form-row">
                      <label>Aviso do Coral / Geral</label>
                      <input
                        className="input"
                        value={avisoCoral}
                        onChange={(e) => setAvisoCoral(e.target.value)}
                        placeholder="Ex: Todos os louvores serão cantados pelo coral."
                      />
                    </div>
                  </div>

                  <div className="wa-songs-section">
                    <div className="wa-section-header">
                      <strong>Louvores a serem tocados:</strong>
                      <button
                        className="button secondary compact"
                        onClick={handleAddSong}
                        type="button"
                      >
                        <Plus size={14} /> Adicionar louvor
                      </button>
                    </div>

                    {songs.map((song, idx) => (
                      <div className="wa-song-card" key={idx}>
                        <div className="wa-song-card-header">
                          <span className="wa-song-number">#{idx + 1}</span>
                          <input
                            className="input wa-song-name-input"
                            value={song.nome}
                            onChange={(e) => handleSongChange(idx, "nome", e.target.value)}
                            placeholder="Nome do louvor (ex: Baruk - meu senhor, Jesus Cristo)"
                          />
                          <button
                            className="icon-button danger small"
                            onClick={() => handleRemoveSong(idx)}
                            type="button"
                            title="Remover louvor"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="wa-song-card-details">
                          <input
                            className="input small"
                            value={song.observacoes}
                            onChange={(e) =>
                              handleSongChange(idx, "observacoes", e.target.value)
                            }
                            placeholder="Observação (ex: Esse louvor será tocado enquanto a orquestra desce...)"
                          />
                          <input
                            className="input small"
                            value={song.link}
                            onChange={(e) => handleSongChange(idx, "link", e.target.value)}
                            placeholder="Link de referência (YouTube / Cifra / Letra)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="wa-form-grid-2">
                    <div className="wa-form-row">
                      <label>Louvor Reserva</label>
                      <input
                        className="input"
                        value={reserva}
                        onChange={(e) => setReserva(e.target.value)}
                        placeholder="Ex: Diante do trono - Deus do impossível"
                      />
                    </div>
                    <div className="wa-form-row">
                      <label>Rodapé / Menção</label>
                      <input
                        className="input"
                        value={rodape}
                        onChange={(e) => setRodape(e.target.value)}
                        placeholder="Ex: @todos"
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      className="button secondary compact"
                      onClick={handleReset}
                      type="button"
                    >
                      <RefreshCw size={14} /> Restaurar padrões
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé do Modal com Ações */}
            <div className="wa-modal-footer">
              <button
                className="button secondary"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Fechar
              </button>
              <button
                className="button secondary wa-copy-btn"
                onClick={handleCopy}
                type="button"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? "Copiado!" : "Copiar mensagem"}</span>
              </button>
              <button
                className="button wa-primary-btn"
                onClick={handleShareWhatsApp}
                type="button"
              >
                <WhatsAppIcon size={18} />
                <span>Compartilhar no WhatsApp</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      fill="currentColor"
      height={size}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.357.101.174.45 0.742.966 1.201.666.592 1.228.775 1.401.862.173.087.275.072.376-.044.101-.116.433-.505.549-.679.116-.174.231-.145.39-.087.159.058 1.011.477 1.184.564.173.087.289.13.332.203.043.072.043.419-.101.824z" />
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.434 5.177L2 22l4.962-1.399C8.423 21.493 10.155 22 12 22c5.523 0 10-10.477 10-10S17.523 2 12 2zm0 18.063c-1.605 0-3.124-.46-4.421-1.258l-.317-.193-2.955.833.844-2.878-.207-.33A8.006 8.006 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8.063-8 8.063z" />
    </svg>
  );
}
