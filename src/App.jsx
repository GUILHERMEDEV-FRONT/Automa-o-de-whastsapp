import React, { useState } from "react";
import "./App.css";
import * as XLSX from "xlsx";

export default function App() {
  const [mensagem, setMensagem] = useState("");
  const [destino, setDestino] = useState("jessica");
  const [arquivo, setArquivo] = useState(null);
  const [status, setStatus] = useState("");

  const handleFile = (e) => {
    setArquivo(e.target.files[0]);
  };

  const enviarMensagens = async () => {
    if (!mensagem) {
      setStatus("Por favor, digite a mensagem.");
      return;
    }
    if (!arquivo) {
      setStatus("Por favor, selecione a planilha.");
      return;
    }

    setStatus("Processando arquivo...");

    try {
      const data = await arquivo.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setStatus(`Enviando mensagens para ${jsonData.length} contatos...`);

      for (const contato of jsonData) {
        let msgPersonalizada = mensagem;
        for (const key in contato) {
          const regex = new RegExp(`{${key}}`, "g");
          msgPersonalizada = msgPersonalizada.replace(regex, contato[key]);
        }

        const body = {
          mensagem: msgPersonalizada,
          destino: contato.telefone.replace(/\D/g, ""),
        };

        const res = await fetch(`http://localhost:8008/${destino}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const json = await res.json();

        if (!json.status) {
          console.error("Erro ao enviar para:", contato.telefone);
        }
      }

      setStatus("✅ Mensagens enviadas com sucesso!");
    } catch (error) {
      console.error(error);
      setStatus("❌ Ocorreu um erro ao processar a planilha ou enviar mensagens.");
    }
  };

  return (
    <div>
      <h2>Enviar mensagens via WhatsApp</h2>

      <label>Mensagem</label> 
      <textarea
        rows={4}
       
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Olá {nome}, seu pagamento vence em {vencimento}"/>

      <label>Destino</label>
      <select
        value={destino}
        onChange={(e) => setDestino(e.target.value)}
        
      >
        <option value="jessica">Jessica</option>
        <option value="claudia">Claudia</option>
        <option value="raissa">Raissa</option>
      </select>

      <label>Planilha (.xlsx)</label>
      <input type="file" accept=".xlsx" onChange={handleFile} />

      <button onClick={enviarMensagens}>
        Enviar Mensagens
      </button>

      <p>{status}</p>
    </div>
  );
}
