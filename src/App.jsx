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
            display: "grid", 
            gridTemplateColumns: "1fr auto 1fr", 
            alignItems: "flex-start", 
            width: "100%",
            gap: "16px" 
          }}
        >
          {/* LADO ESQUERDO: CATÁLOGO VIRTUAL / PAINEL ADMINISTRATIVO */}
          <div style={{ textAlign: "left" }}>
            <h1 className="header-title" style={{ margin: 0, fontSize: "20px" }}>
              {visao === "admin" ? "Painel Administrativo" : "Catálogo Virtual"}
            </h1>
          </div>

          {/* CENTRO: LOGO EM 100PX + CAMEL AUTOPEÇAS */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <img
              src="https://wwiyetwzzkvuynizijpm.supabase.co/storage/v1/object/public/Produtos/Design%20sem%20nome.png"
              alt="Logo Camel Autopeças"
              style={{
                height: "100px", // Logo configurada em 100px
                width: "auto",
                objectFit: "contain",
                borderRadius: "6px"
              }}
            />
            <span className="logo-badge" style={{ marginTop: "8px" }}>
              CAMEL • AUTOPEÇAS
            </span>
          </div>

          {/* LADO DIREITO: BOTÃO DO PAINEL DA LOJA */}
          <div style={{ textAlign: "right" }}>
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
