import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import { FaPlusCircle, FaTrash, FaEdit, FaSave, FaSearch } from "react-icons/fa";

// Conectar ao Supabase
const SUPABASE_URL = "https://ehnketngffiufpnwrgfa.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobmtldG5nZmZpdWZwbndyZ2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDE0MjIsImV4cCI6MjA1NjQxNzQyMn0.Eo1kX5fG-0_uDfyhvMSUK8YGmcZcYbiUA5cLoVOh0MY"; // Substitua pela sua chave correta
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Cadastro() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const [referencia, setReferencia] = useState("");
  const [nome, setNome] = useState("");
  const [embalagem, setEmbalagem] = useState("");

  useEffect(() => {
    buscarProdutos();
  }, []);

  async function buscarProdutos() {
    let { data, error } = await supabase.from("Produtos").select("*");

    if (error) {
      console.error("Erro ao buscar produtos:", error);
    } else {
      setProdutos(data || []);
    }
  }

  async function cadastrarOuEditarProduto() {
    if (!referencia || !nome || !embalagem) {
      alert("Preencha todos os campos!");
      return;
    }

    if (editandoId) {
      await supabase.from("Produtos").update({ referencia, nome, embalagem }).eq("id", editandoId);
      setEditandoId(null);
    } else {
      await supabase.from("Produtos").insert([{ referencia, nome, embalagem }]);
    }

    buscarProdutos();
    limparCampos();
  }

  function editarProduto(produto) {
    setEditandoId(produto.id);
    setReferencia(produto.referencia);
    setNome(produto.nome);
    setEmbalagem(produto.embalagem);
  }

  function limparCampos() {
    setReferencia("");
    setNome("");
    setEmbalagem("");
    setEditandoId(null);
  }

  return (
    <div className="container">
      <h1>📝 Cadastro de Produtos</h1>

      <div className="form-container">
        <input type="text" placeholder="Referência" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
        <input type="text" placeholder="Nome do Produto" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input type="text" placeholder="Embalagem" value={embalagem} onChange={(e) => setEmbalagem(e.target.value)} />
        <button onClick={cadastrarOuEditarProduto} className="btn-cadastrar">
          {editandoId ? <FaSave /> : <FaPlusCircle />} {editandoId ? "Salvar Alterações" : "Cadastrar"}
        </button>
      </div>

      <input type="text" placeholder="🔍 Pesquisar Produto..." value={filtro} onChange={(e) => setFiltro(e.target.value)} className="search-input" />

      <table>
        <thead>
          <tr>
            <th>Referência</th>
            <th>Nome</th>
            <th>Embalagem</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos
            .filter((produto) => produto.nome.toLowerCase().includes(filtro.toLowerCase()))
            .map((produto) => (
              <tr key={produto.id}>
                <td>{produto.referencia}</td>
                <td>{produto.nome}</td>
                <td>{produto.embalagem}</td>
                <td>
                  <button onClick={() => editarProduto(produto)} className="btn-editar">
                    <FaEdit /> Editar
                  </button>
                  <button onClick={() => supabase.from("Produtos").delete().eq("id", produto.id)} className="btn-excluir">
                    <FaTrash /> Excluir
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
