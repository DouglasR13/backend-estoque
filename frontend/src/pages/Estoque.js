import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";
import { FaArrowLeft, FaArrowRight, FaSearch, FaBox } from "react-icons/fa";

// 🔹 Conectar ao Supabase
const SUPABASE_URL = "https://ehnketngffiufpnwrgfa.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobmtldG5nZmZpdWZwbndyZ2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDE0MjIsImV4cCI6MjA1NjQxNzQyMn0.Eo1kX5fG-0_uDfyhvMSUK8YGmcZcYbiUA5cLoVOh0MY"; // Substitua pela sua chave correta
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroNaoEstocados, setFiltroNaoEstocados] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [paginaInput, setPaginaInput] = useState(1);
  const itensPorPagina = 50; // 🔹 Exibe 50 produtos por página

  useEffect(() => {
    buscarProdutos();
  }, [paginaAtual, filtro, filtroNaoEstocados]);

  // 🔹 Buscar produtos do Supabase com filtros e paginação
  async function buscarProdutos() {
    const offset = (paginaAtual - 1) * itensPorPagina;

    let query = supabase
      .from("Estoque")
      .select("*", { count: "exact" })
      .range(offset, offset + itensPorPagina - 1);

    if (filtro) {
      query = query.or(
        `nome.ilike.%${filtro}%, referencia.ilike.%${filtro}%, lote.ilike.%${filtro}%, classificacao.ilike.%${filtro}%`
      );
    }

    if (filtroNaoEstocados) {
      query = query.filter("estocado", "neq", true);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("Erro ao buscar produtos do estoque:", error);
    } else {
      setProdutos(data || []);
      setTotalPaginas(Math.ceil(count / itensPorPagina));
    }
  }

  // 🔹 Atualizar campo de "Localização" ou "Quantidade" ao pressionar Enter ou sair do campo
  async function atualizarProduto(id, campo, valor) {
    const { error } = await supabase
      .from("Estoque")
      .update({ [campo]: valor })
      .eq("id", id);

    if (error) {
      console.error(`Erro ao atualizar ${campo}:`, error);
    } else {
      buscarProdutos(); // Atualiza a lista para refletir a mudança
    }
  }

  // 🔹 Marcar produto como estocado e registrar "Carimbo de Estoque"
  async function estocarProduto(id) {
    const dataEstocagem = new Date().toISOString();

    const { error } = await supabase
      .from("Estoque")
      .update({ estocado: true, data_estocagem: dataEstocagem })
      .eq("id", id);

    if (error) {
      alert("Erro ao estocar o produto: " + error.message);
    } else {
      buscarProdutos(); // Atualiza a tabela imediatamente
    }
  }

  return (
    <div className="container">
      <h1>📦 Gerenciamento de Estoque</h1>

      {/* 🔹 Filtros */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 Buscar por Nome, Referência, Lote ou Classificação..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="search-input"
        />
        <FaSearch className="search-icon" />

        {/* 🔹 Filtro para mostrar apenas não estocados */}
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filtroNaoEstocados}
            onChange={() => setFiltroNaoEstocados(!filtroNaoEstocados)}
          />
          Mostrar apenas <strong>Não Estocados</strong>
        </label>
      </div>

      {/* 🔹 Tabela de Estoque */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Referência</th>
              <th>Nome</th>
              <th>Lote</th>
              <th>Embalagem</th>
              <th>Quantidade Sugerida</th>
              <th>Quantidade</th>
              <th>Classificação</th>
              <th>Localização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">Nenhum produto encontrado.</td>
              </tr>
            ) : (
              produtos.map((produto) => (
                <tr key={produto.id} className={produto.estocado ? "estocado" : ""}>
                  <td>{produto.referencia}</td>
                  <td>{produto.nome}</td>
                  <td>{produto.lote}</td>
                  <td>{produto.embalagem || "Sem Embalagem"}</td>
                  <td>{produto.quantidade_sugerida}</td>
                  <td>
                    <input
                      type="number"
                      className="input-editavel"
                      value={produto.quantidade}
                      onChange={(e) => atualizarProduto(produto.id, "quantidade", e.target.value)}
                      onBlur={(e) => atualizarProduto(produto.id, "quantidade", e.target.value)}
                    />
                  </td>
                  <td>{produto.classificacao}</td>
                  <td>
                    <input
                      type="text"
                      className="input-editavel"
                      value={produto.localizacao || ""}
                      onChange={(e) => atualizarProduto(produto.id, "localizacao", e.target.value)}
                      onBlur={(e) => atualizarProduto(produto.id, "localizacao", e.target.value)}
                    />
                  </td>
                  <td>
                    {!produto.estocado ? (
                      <button onClick={() => estocarProduto(produto.id)} className="btn-estocar">
                        <FaBox /> Estocar
                      </button>
                    ) : (
                      <span className="tag-estocado">✅ Estocado</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
