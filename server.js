require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const { google } = require("googleapis");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Conectar ao Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🔹 Configurar conexão com a API do Google Sheets usando variáveis de ambiente
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS), // 🔹 Credenciais como string JSON na variável de ambiente
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

// 🔹 Rota para sincronizar os dados da planilha com o Supabase
app.get("/sincronizar", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID, // 🔹 Agora usando variável de ambiente
      range: "Carimbo Estoque!A2:H",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).send("Nenhum dado encontrado na planilha.");
    }

    // 🔹 Transformar os dados e enviar para o Supabase
    const dadosParaInserir = rows.map((row) => ({
      dataHora: row[0],
      nome: row[1],
      quantidade: row[2] || 0,
      referencia: row[3] || "Sem referência",
      lote: row[4] || "Sem lote",
      embalagem: row[5] || "Sem embalagem",
      risco: row[6] || "Desconhecido",
      classificacao: row[7] || "Sem classificação",
    }));

    const { error } = await supabase.from("Estoque").upsert(dadosParaInserir);
    if (error) throw error;

    res.send("✅ Sincronização concluída com sucesso!");
  } catch (error) {
    console.error("Erro ao buscar dados do Google Sheets:", error);
    res.status(500).send("❌ Erro ao sincronizar.");
  }
});

// 🔹 Rota de teste
app.get("/", (req, res) => {
  res.send("✅ API rodando com sucesso!");
});

// 🔹 Iniciar o servidor na porta correta
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API rodando na porta ${PORT}`);
});
