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

// 🔹 Configurar conexão com a API do Google Sheets
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json", // 🔹 Arquivo de credenciais do Google
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

// 🔹 Rota para sincronizar os dados da planilha com o banco
app.get("/sincronizar", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1kl2JWBTyo86cWLFWYBV3lusxyog-aZP0uaDx4uzlKRI", // 🔹 Substitua pelo ID da sua planilha
      range: "Carimbo Estoque!A2:H", // 🔹 Ajuste conforme sua planilha
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).send("Nenhum dado encontrado na planilha.");
    }

    // 🔹 Transformar os dados e enviar para o Supabase
    for (const row of rows) {
      const [dataHora, nome, quantidade, referencia, lote, embalagem, risco, classificacao] = row;

      // 🔹 Inserir no Supabase
      const { error } = await supabase
        .from("Estoque")
        .upsert([{ nome, quantidade, referencia, lote, embalagem, risco, classificacao }]);

      if (error) {
        console.error("Erro ao inserir no Supabase:", error);
      }
    }

    res.send("Sincronização concluída com sucesso!");
  } catch (error) {
    console.error("Erro ao buscar dados do Google Sheets:", error);
    res.status(500).send("Erro ao sincronizar.");
  }
});

// 🔹 Iniciar o servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});
