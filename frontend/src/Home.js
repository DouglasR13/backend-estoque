import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import {
  FaSun,
  FaMoon,
  FaSave,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaPlusCircle,
} from "react-icons/fa";

// Conectar ao Supabase
const SUPABASE_URL = "https://ehnketngffiufpnwrgfa.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobmtldG5nZmZpdWZwbndyZ2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDE0MjIsImV4cCI6MjA1NjQxNzQyMn0.Eo1kX5fG-0_uDfyhvMSUK8YGmcZcYbiUA5cLoVOh0MY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotStockedOnly, setShowNotStockedOnly] = useState(false);
  const [classificacaoFilter, setClassificacaoFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const produtosPorPagina = 50;
  const navigate = useNavigate();

  useEffect(() => {
    buscarProdutos();
  }, [searchTerm, showNotStockedOnly, classificacaoFilter, currentPage]);

  async function buscarProdutos() {
    setLoading(true);

    let query = supabase
      .from("Estoque")
      .select("*")
      .range(
        (currentPage - 1) * produtosPorPagina,
        currentPage * produtosPorPagina - 1
      );

    if (searchTerm.trim() !== "") {
      query = query.or(
        `nome.ilike.%${searchTerm}%, referencia.ilike.%${searchTerm}%, lote.ilike.%${searchTerm}%, localizacao.ilike.%${searchTerm}%, classificacao.ilike.%${searchTerm}%`
      );
    }

    if (showNotStockedOnly) {
      query = query.or("estocado.eq.false,estocado.is.null");
    }

    if (classificacaoFilter !== "") {
      query = query.eq("classificacao", classificacaoFilter);
    }

    let { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar produtos:", error);
    } else {
      setProdutos(data || []);
    }
    setLoading(false);
  }

  async function salvarProduto(id, quantidade, localizacao) {
    setLoading(true);
    const dataEstocagem = new Date().toISOString();

    const { error } = await supabase
      .from("Estoque")
      .update({ quantidade, localizacao, estocado: true, data_estocagem: dataEstocagem })
      .eq("id", id);

    if (!error) {
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, quantidade, localizacao, estocado: true, data_estocagem: dataEstocagem }
            : p
        )
      );
    }
    setLoading(false);
  }

  return (
    <div className={`container ${darkMode ? "dark-mode" : ""}`}>
      <header>
        <h1>Gerenciamento de Estoque</h1>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </header>

      <div className="filters">
        <input
          type="text"
          placeholder="Pesquisar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button className="filter-btn" onClick={() => setShowNotStockedOnly(!showNotStockedOnly)}>
          {showNotStockedOnly ? "Mostrar Todos" : "Somente Não Estocados"}
        </button>
        <select onChange={(e) => setClassificacaoFilter(e.target.value)} value={classificacaoFilter} className="filter-select">
          <option value="">Todas as Classificações</option>
          <option value="Químico">Químico</option>
          <option value="Perecível">Perecível</option>
        </select>
        <button className="clear-btn" onClick={() => { setSearchTerm(""); setShowNotStockedOnly(false); setClassificacaoFilter(""); }}>
          <FaCheckCircle /> Limpar Filtros
        </button>
        <button className="btn-cadastro" onClick={() => navigate("/cadastro")}>
          <FaPlusCircle /> Cadastro
        </button>
      </div>

      {loading && <div className="loading">Carregando...</div>}

      <table>
        <thead>
          <tr>
            <th>Referência</th>
            <th>Nome</th>
            <th>Lote</th>
            <th>Quantidade</th>
            <th>Localização</th>
            <th>Classificação</th>
            <th>Estocado</th>
            <th>Data Estocagem</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id} className={produto.estocado ? "estocado" : "nao-estocado"}>
              <td>{produto.referencia}</td>
              <td>{produto.nome}</td>
              <td>{produto.lote}</td>
              <td>{produto.quantidade}</td>
              <td>{produto.localizacao}</td>
              <td>{produto.classificacao}</td>
              <td>{produto.estocado ? "✔️ Sim" : "❌ Não"}</td>
              <td>{produto.data_estocagem ? new Date(produto.data_estocagem).toLocaleString() : "N/A"}</td>
              <td>
                {!produto.estocado && (
                  <button className="btn-salvar" onClick={() => salvarProduto(produto.id, produto.quantidade, produto.localizacao)}>
                    <FaSave /> Salvar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
