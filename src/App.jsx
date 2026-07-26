import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import CatalogoCliente from "./data/CatalogoCliente";
import PainelAdmin from "./data/PainelAdmin";
import "./App.css";

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [visao, setVisao] = useState("cliente");
  const [carrinho, setCarrinho] = useState([]);

  // ⚠️ DIGITE O NÚMERO DO WHATSAPP DA LOJA AQUI (Com DDD, ex: "5532999999999")
  const NUMERO_WHATSAPP = "5532999999999";

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

  // --- FUNÇÕES DO CARRINHO DE COMPRAS ---

  // 1. Adicionar produto ao carrinho
  const adicionarAoCarrinho = (produto) => {
    setCarrinho((prev) => {
      const itemExistente = prev.find((item) => item.id === produto.id);
      if (itemExistente) {
        return prev.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  // 2. Remover produto do carrinho
  const removerDoCarrinho = (idProduto) => {
    setCarrinho((prev) => prev.filter((item) => item.id !== idProduto));
  };

  // 3. Alterar quantidade (+1 ou -1)
  const alterarQuantidade = (idProduto, delta) => {
    setCarrinho((prev) =>
      prev
        .map((item) => {
          if (item.id === idProduto) {
            const novaQtd = item.quantidade + delta;
            return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // 4. Limpar o carrinho
  const limparCarrinho = () => {
    setCarrinho([]);
  };

  // 5. Enviar mensagem formatada para o WhatsApp da loja
  const enviarPedidoWhatsApp = () => {
    if (carrinho.length === 0) return;

    let mensagem = "👋 *Olá! Gostaria de fazer uma cotação/orçamento dos seguintes itens:*\n\n";

    carrinho.forEach((item, index) => {
      mensagem += `${index + 1}. *${item.nome}*\n`;
      if (item.codigo) mensagem += `   - Cód: ${item.codigo}\n`;
      mensagem += `   - Quantidade: ${item.quantidade}\n\n`;
    });

    mensagem += "Podem me confirmar a disponibilidade e valores?";

    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  };

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

  // Quantidade total de itens no carrinho
  const totalItensCarrinho = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

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
                height: "100px",
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
          <CatalogoCliente 
            produtos={produtos}
            carrinho={carrinho}
            adicionarAoCarrinho={adicionarAoCarrinho}
            removerDoCarrinho={removerDoCarrinho}
            alterarQuantidade={alterarQuantidade}
            limparCarrinho={limparCarrinho}
            enviarPedidoWhatsApp={enviarPedidoWhatsApp}
            totalItensCarrinho={totalItensCarrinho}
          />
        )}
      </main>
    </div>
  );
}
