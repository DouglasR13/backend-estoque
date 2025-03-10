import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Estoque from "./pages/Estoque";
import Cadastro from "./pages/Cadastro";
import Contagem from "./pages/Contagem"; // 🔹 Importamos a nova página
import Configuracoes from "./pages/Configuracoes";
import "./styles.css";

export default function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Estoque />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/contagem" element={<Contagem />} /> {/* 🔹 Nova Rota */}
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </div>
    </>
  );
}
