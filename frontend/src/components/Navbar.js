import React from "react";
import { Link } from "react-router-dom";
import "./styles.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/estoque">📦 Estoque</Link></li>
        <li><Link to="/cadastro">📋 Cadastro</Link></li>
        <li><Link to="/contagem">📊 Contagem</Link></li> {/* 🔹 Novo botão */}
        <li><Link to="/configuracoes">⚙️ Configurações</Link></li>
      </ul>
    </nav>
  );
}
