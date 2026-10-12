import Image from "next/image";
import { getLatestLouvoresCulto } from "@/features/louvores/queries";
import { WhatsAppShareButton } from "@/features/louvores/whatsapp-share-button";

export default async function CronogramaPage() {
  const { dataCulto, louvores } = await getLatestLouvoresCulto();
  
  let dataFormatada = "";
  if (dataCulto) {
    const [ano, mes, dia] = dataCulto.split("-");
    dataFormatada = dia + "/" + mes + "/" + ano;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px", height: "100%", overflowY: "auto" }}>
      <div style={{
        width: "100%",
        maxWidth: "900px",
        marginBottom: "14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: "bold", color: "var(--muted)" }}>
            ORGANIZAÇÃO DO CULTO
          </span>
          {dataFormatada ? (
            <span className="badge" style={{ fontSize: "0.75rem" }}>
              {dataFormatada}
            </span>
          ) : null}
        </div>
        <WhatsAppShareButton dataCulto={dataCulto} louvores={louvores} />
      </div>

      <div className="cronograma-container" style={{
        width: "100%",
        maxWidth: "900px", 
        backgroundColor: "#fff", 
        padding: "15px 30px", 
        boxShadow: "var(--shadow)", 
        borderRadius: "var(--radius)",
        color: "#000",
        fontFamily: "Arial, sans-serif",
        border: "1px solid #eaeaea"
      }}>
        
        {/* Header do Cronograma */}
        <div style={{ display: "flex", backgroundColor: "#000", color: "#fff", height: "70px", marginBottom: "15px", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ width: "80px", height: "100%", backgroundColor: "#cf2e2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Image src="/images/adnipo-logo.jpeg" alt="Logo" width={50} height={50} style={{ borderRadius: "50%", border: "2px solid #fff" }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "bold", letterSpacing: "1px" }}>ORGANIZAÇÃO DO CULTO</h1>
            <span style={{ fontSize: "12px", letterSpacing: "2px" }}>adnipo itaquera</span>
          </div>
        </div>

        <h2 style={{ textAlign: "center", fontWeight: "bold", textDecoration: "underline", fontSize: "16px", margin: "0 0 15px 0" }}>
          Culto da família - Domingo {dataFormatada ? "(" + dataFormatada + ")" : ""}
        </h2>

        {/* Tabela 1: Horários Fixos Início */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", textAlign: "center", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#000", color: "#fff", fontSize: "12px" }}>
              <th style={{ padding: "6px", width: "20%" }}>HORÁRIO</th>
              <th style={{ padding: "6px", width: "40%" }}>ATIVIDADE</th>
              <th style={{ padding: "6px", width: "40%" }}>GRUPO</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: "#f9f9f9", borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px", fontWeight: "bold" }}>16:00</td>
              <td style={{ padding: "5px" }}>Passagem de Som</td>
              <td style={{ padding: "5px" }}>Banda</td>
            </tr>
            <tr style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px", fontWeight: "bold" }}>16:45</td>
              <td style={{ padding: "5px" }}>Passagem de Som</td>
              <td style={{ padding: "5px" }}>Orquestra</td>
            </tr>
            <tr style={{ backgroundColor: "#f9f9f9", borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px", fontWeight: "bold" }}>17:00</td>
              <td style={{ padding: "5px" }}>Passagem de Som</td>
              <td style={{ padding: "5px" }}>Orquestra & Coral</td>
            </tr>
            <tr style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px", fontWeight: "bold" }}>17:30</td>
              <td style={{ padding: "5px" }}>Lanche</td>
              <td style={{ padding: "5px" }}>Todos</td>
            </tr>
            <tr style={{ backgroundColor: "#f9f9f9", borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px", fontWeight: "bold" }}>17:50</td>
              <td style={{ padding: "5px" }}>Devocional</td>
              <td style={{ padding: "5px" }}>Todos nos Lugares</td>
            </tr>
            <tr style={{ backgroundColor: "#ffffff", borderBottom: "2px solid #000" }}>
              <td style={{ padding: "5px", fontWeight: "bold" }}>18:00</td>
              <td style={{ padding: "5px", fontWeight: "bold" }}>Início do Culto</td>
              <td style={{ padding: "5px" }}></td>
            </tr>
          </tbody>
        </table>

        {/* Tabela 2: Louvores Dinâmicos */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", textAlign: "left", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#000", color: "#fff", fontSize: "12px" }}>
              <th style={{ padding: "6px", width: "20%" }}></th>
              <th style={{ padding: "6px", width: "40%", textAlign: "center" }}>LOUVORES</th>
              <th style={{ padding: "6px", width: "20%", textAlign: "center" }}>GRUPO</th>
              <th style={{ padding: "6px", width: "20%", textAlign: "center" }}>CANTORES</th>
            </tr>
          </thead>
          <tbody>
            {louvores.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "10px", textAlign: "center", backgroundColor: "#f9f9f9" }}>
                  Nenhum louvor registrado para esta data.
                </td>
              </tr>
            ) : (
              louvores.map((l: any, i: number) => {
                let grupoText = "";
                if (l.tipo_louvor === "HARPA" || l.tipo_louvor === "ADNIPO") {
                  grupoText = "Orquestra & Coral";
                } else {
                  grupoText = "Banda";
                }

                return (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f9f9f9" : "#ffffff", borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "5px", fontWeight: "bold", fontSize: "12px" }}>{l.tipo_louvor || ""}</td>
                    <td style={{ padding: "5px", fontWeight: "500" }}>{l.nome}</td>
                    <td style={{ padding: "5px", textAlign: "center" }}>{grupoText}</td>
                    <td style={{ padding: "5px" }}></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Tabela 3: Horários Fixos Fim */}
        <table style={{ width: "80%", borderCollapse: "collapse", textAlign: "center", margin: "0 auto", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#000", color: "#fff", fontSize: "12px" }}>
              <th style={{ padding: "6px", width: "30%" }}>HORÁRIO</th>
              <th style={{ padding: "6px", width: "70%", textAlign: "center" }}>ATIVIDADE</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: "#f9f9f9", borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px", fontWeight: "bold" }}>18:45</td>
              <td style={{ padding: "5px", textAlign: "center" }}>
                Palavra - <span style={{ fontWeight: "bold" }}>Pastor</span>
              </td>
            </tr>
            <tr style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px", fontWeight: "bold" }}>19:50</td>
              <td style={{ padding: "5px", textAlign: "center" }}>
                Avisos e Visitantes - <span style={{ fontWeight: "bold" }}>Louvor Final</span>
              </td>
            </tr>
            <tr style={{ backgroundColor: "#f9f9f9", borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px", fontWeight: "bold" }}>20:00</td>
              <td style={{ padding: "5px", textAlign: "center", fontWeight: "bold" }}>
                Final do Culto
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}