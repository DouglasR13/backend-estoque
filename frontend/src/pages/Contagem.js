import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";
import { FaSearch, FaArrowLeft, FaArrowRight } from "react-icons/fa";

// 🔹 Conectar ao Supabase
const SUPABASE_URL = "https://ehnketngffiufpnwrgfa.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobmtldG5nZmZpdWZwbndyZ2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDE0MjIsImV4cCI6MjA1NjQxNzQyMn0.Eo1kX5fG-0_uDfyhvMSUK8YGmcZcYbiUA5cLoVOh0MY"; // Substitua pela chave correta
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Contagem() {
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [paginaInput, setPaginaInput] = useState(1);
  const itensPorPagina = 50;

  useEffect(() => {
    buscarProdutos();
  }, [paginaAtual, filtro, filtroStatus]);

  // 🔹 Buscar produtos do Supabase com filtros e paginação
  async function buscarProdutos() {
    const offset = (paginaAtual - 1) * itensPorPagina;

    let query = supabase
      .from("Box")
      .select("*", { count: "exact" })
      .range(offset, offset + itensPorPagina - 1);

    // 🔹 Filtro por Nome, Referência ou Lote
    if (filtro) {
      query = query.or(
        `nome.ilike.%${filtro}%, referencia.ilike.%${filtro}%, lote.ilike.%${filtro}%`
      );
    }

    // 🔹 Filtro por Status ("Pendente" agora inclui os vazios corretamente)
    if (filtroStatus === "Contado") {
      query = query.eq("status", "Contado");
    } else if (filtroStatus === "Pendente") {
      query = query.or("status.eq.Pendente,status.is.null,status.eq."); 
    }
    

    const { data, count, error } = await query;

    if (error) {
      console.error("Erro ao buscar produtos:", error);
    } else {
      setProdutos(data || []);
      setTotalPaginas(Math.ceil(count / itensPorPagina));
    }
  }

  // 🔹 Atualizar qualquer campo no banco de dados
  async function atualizarProduto(id, campo, valor) {
    let updateData = { [campo]: valor };

    // 🔹 Se o campo atualizado for "status" e ele for "Contado", registra a Data Contagem
    if (campo === "status" && valor === "Contado") {
      updateData.data_contagem = new Date().toISOString();
    }

    const { error } = await supabase.from("Box").update(updateData).eq("id", id);

    if (error) {
      console.error(`Erro ao atualizar ${campo}:`, error);
    } else {
      buscarProdutos(); // Atualiza a lista após a alteração
    }
  }

  return (
    <div className="container">
      <h1>📊 Contagem de Estoque por Box</h1>

      {/* 🔹 Filtros */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 Buscar por Nome, Referência ou Lote..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="search-input"
        />

        {/* 🔹 Filtro por Status */}
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="status-filter"
        >
          <option value="">Todos</option>
          <option value="Contado">Contado</option>
          <option value="Pendente">Pendente</option>
        </select>
      </div>

      {/* 🔹 Paginação */}
      <div className="pagination-controls">
        <button
          onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
          disabled={paginaAtual === 1}
        >
          <FaArrowLeft /> Anterior
        </button>

        <input
          type="number"
          value={paginaInput}
          onChange={(e) => setPaginaInput(e.target.value)}
          onBlur={() => {
            let novaPagina = Math.min(Math.max(parseInt(paginaInput), 1), totalPaginas);
            setPaginaAtual(novaPagina);
          }}
          className="page-input"
        />

        <span>de {totalPaginas}</span>

        <button
          onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
          disabled={paginaAtual === totalPaginas}
        >
          Próximo <FaArrowRight />
        </button>
      </div>

      {/* 🔹 Tabela de Contagem */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Localização</th>
              <th>Referência</th>
              <th>Nome</th>
              <th>Embalagem</th>
              <th>Lote</th>
              <th>Estoque</th>
              <th>Reservada</th>
              <th>Disponível</th>
              <th>Contada</th>
              <th>Data Contagem</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-data">
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              produtos.map((produto) => (
                <tr key={produto.id}>
                  <td>{produto.localizacao}</td>
                  <td>{produto.referencia}</td>
                  <td>{produto.nome}</td>
                  <td>{produto.embalagem || "Sem Embalagem"}</td>
                  <td>{produto.lote}</td>
                  <td>{produto.estoque}</td>
                  <td>{produto.reservada}</td>
                  <td>{produto.disponivel}</td>
                  <td>{produto.contada}</td>
                  <td>
                    {produto.data_contagem
                      ? new Date(produto.data_contagem).toLocaleDateString(
                          "pt-BR"
                        )
                      : "Sem Data"}
                  </td>
                  <td>
                    <select
                      value={produto.status || "Pendente"}
                      onChange={(e) =>
                        atualizarProduto(produto.id, "status", e.target.value)
                      }
                      className={`status-dropdown ${
                        produto.status === "Contado" ? "contado" : "pendente"
                      }`}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Contado">Contado</option>
                    </select>
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
