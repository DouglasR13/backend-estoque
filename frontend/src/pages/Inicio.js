import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { FaBox, FaChartBar, FaClipboardList } from "react-icons/fa";
import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto"; // Biblioteca para gráficos
import "../styles.css"; // Mantendo o design

// 🔹 Conectar ao Supabase
const SUPABASE_URL = "https://ehnketngffiufpnwrgfa.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobmtldG5nZmZpdWZwbndyZ2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDE0MjIsImV4cCI6MjA1NjQxNzQyMn0.Eo1kX5fG-0_uDfyhvMSUK8YGmcZcYbiUA5cLoVOh0MY"; // Substitua pela sua chave correta
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Inicio() {
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [naoEstocados, setNaoEstocados] = useState(0);
  const [ocupacaoBoxes, setOcupacaoBoxes] = useState([]);
  const [estoquePorClassificacao, setEstoquePorClassificacao] = useState([]);
  const [lotesPorMes, setLotesPorMes] = useState([]);
  const [produtos, setProdutos] = useState([]); // ✅ Agora estamos carregando os produtos corretamente!

  useEffect(() => {
    buscarDadosEstoque();
  }, []);

  async function buscarDadosEstoque() {
    // 🔹 Buscar total de produtos no estoque
    const { data: produtos, error } = await supabase.from("Estoque").select("*");

    console.log("📌 Produtos carregados:", produtos); // 🔹 Debug para verificar se os produtos estão sendo carregados

    if (error) {
      console.error("❌ Erro ao buscar dados do estoque:", error);
      return;
    }

    setProdutos(produtos); // ✅ Agora os produtos são armazenados corretamente

    // Contagem de total e não estocados
    const total = produtos.length;
    const naoEstocadosCount = produtos.filter((p) => !p.estocado).length;

    setTotalProdutos(total);
    setNaoEstocados(naoEstocadosCount);

    // 🔹 Criar dados para gráfico de ocupação dos boxes
    const { data: boxes } = await supabase.from("Boxes").select("box, ocupacao"); // Ajuste conforme necessário
    setOcupacaoBoxes(boxes || []);

    // 🔹 Criar dados para gráfico de classificação
    const classificacoes = {};
    produtos.forEach((p) => {
      classificacoes[p.classificacao] = (classificacoes[p.classificacao] || 0) + 1;
    });

    setEstoquePorClassificacao(
      Object.entries(classificacoes).map(([key, value]) => ({
        categoria: key,
        quantidade: value,
      }))
    );

    // 🔹 Criar gráfico de produtos estocados por mês
    const meses = Array(12).fill(0);
    produtos.forEach((p) => {
      if (p.data_estocagem) {
        const mes = new Date(p.data_estocagem).getMonth(); // Pega o número do mês (0-11)
        meses[mes]++;
      }
    });

    setLotesPorMes(meses);
  }

  return (
    <div className="dashboard">
      <h1>📊 Dashboard de Estoque</h1>

      {/* 🔹 Indicadores Rápidos */}
      <div className="dashboard-cards">
        <div className="card">
          <FaBox className="icon" />
          <h3>Total de Produtos</h3>
          <p>{totalProdutos}</p>
        </div>

        <div className="card alert">
          <FaClipboardList className="icon" />
          <h3>Produtos Não Estocados</h3>
          <p>{naoEstocados}</p>
        </div>
      </div>

      {/* 🔹 Gráfico de Ocupação dos Boxes */}
      <div className="chart-container">
        <h2>📦 Ocupação dos Boxes</h2>
        <div className="chart-wrapper">
          <Bar
            data={{
              labels: ocupacaoBoxes.map((b) => b.box),
              datasets: [
                {
                  label: "Ocupação (%)",
                  data: ocupacaoBoxes.map((b) => b.ocupacao),
                  backgroundColor: "#007bff",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </div>
      </div>

      {/* 🔹 Gráfico de Produtos por Classificação */}
      <div className="chart-container">
        <h2>📌 Estoque por Classificação</h2>
        <div className="chart-wrapper">
          <Pie
            data={{
              labels: estoquePorClassificacao.map((c) => c.categoria),
              datasets: [
                {
                  label: "Quantidade",
                  data: estoquePorClassificacao.map((c) => c.quantidade),
                  backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"],
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>

      {/* 🔹 Novo Gráfico de Produtos Estocados por Mês */}
      <div className="chart-container">
        <h2>📆 Produtos Estocados por Mês</h2>
        <div className="chart-wrapper">
          <Line
            data={{
              labels: [
                "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"
              ],
              datasets: [
                {
                  label: "Lotes Estocados",
                  data: lotesPorMes,
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 2,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
