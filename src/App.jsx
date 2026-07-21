import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import CatalogoCliente from "./data/CatalogoCliente";
import PainelAdmin from "./data/PainelAdmin";
import "./App.css";

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [visao, setVisao] = useState("cliente");

  // Função para buscar os produtos diretamente do Supabase
  const buscarProdutos = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarProdutos();

    // Inscreve para atualizações em tempo real no banco
    const canal = supabase
      .channel("mudancas-produtos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "produtos" },
        () => {
          buscarProdutos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  // Alterna a visão com verificação de senha
  const handleAlternarVisao = () => {
    if (visao === "admin") {
      setVisao("cliente");
    } else {
      const senhaDigitada = prompt("Digite a senha de administrador:");
      if (senhaDigitada === "camel123") {
        setVisao("admin");
      } else if (senhaDigitada !== null) {
        alert("Senha incorreta! Acesso negado.");
      }
    }
  };

  if (carregando) {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "#fff" }}>
        <h2>Carregando catálogo...</h2>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <div 
          className="header-content" 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justify: "center",
            textAlign: "center",
            gap: "12px" 
          }}
        >
          {/* LOGO CENTRALIZADA EM CIMA */}
          <img
            src="https://wwiyetwzzkvuynizijpm.supabase.co/storage/v1/object/public/Produtos/Design%20sem%20nome.png"
            alt="Logo Camel Autopeças"
            style={{
              height: "80px", // Ajustado para 80px para dar bastante destaque no centro
              width: "auto",
              objectFit: "contain",
              borderRadius: "6px"
            }}
          />

          {/* TEXTO EMBAIXO DA LOGO */}
          <div>
            <span className="logo-badge">CAMEL • AUTOPEÇAS</span>
            <h1 className="header-title" style={{ marginTop: "4px" }}>
              {visao === "admin" ? "Painel Administrativo" : "Catálogo Virtual"}
            </h1>
          </div>

          {/* BOTÃO DO PAINEL */}
          <div style={{ marginTop: "4px" }}>
            <button
              className="btn-admin"
              onClick={handleAlternarVisao}
            >
              {visao === "admin" ? "🔒 Sair do Painel" : "⚙️ Painel da Loja"}
            </button>
          </div>
        </div>
      </header>

      <main>
        {visao === "admin" ? (
          <PainelAdmin produtos={produtos} buscarProdutos={buscarProdutos} />
        ) : (
          <CatalogoCliente produtos={produtos} />
        )}
      </main>
    </div>
  );
}
