import React, { useState } from 'react';

export default function CatalogoCliente({ 
  produtos = [], 
  categorias = [], 
  carrinho = [], 
  adicionarAoCarrinho, 
  removerDoCarrinho, 
  alterarQuantidade, 
  limparCarrinho, 
  enviarPedidoWhatsApp, 
  totalItensCarrinho = 0 
}) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const [busca, setBusca] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [modalCarrinhoAberto, setModalCarrinhoAberto] = useState(false);

  // Número do WhatsApp da loja para dúvidas individuais
  const whatsappNumber = "5532999842634";

  // Função auxiliar para formatar valor em R$
  const formatarPreco = (valor) => {
    if (valor === null || valor === undefined || valor === '') return null;
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Monta a lista de exibição garantindo que 'Todas as Peças' seja a 1ª opção
  const categoriasExibicao = categorias.some((c) => c.id === 'todas')
    ? categorias
    : [{ id: 'todas', nome: 'Todas as Peças' }, ...categorias];

  const produtosFiltrados = produtos.filter((item) => {
    const bateCategoria = categoriaAtiva === 'todas' || item.categoria === categoriaAtiva;
    const termoBusca = busca.toLowerCase().trim();
    const bateBusca = (item.nome && item.nome.toLowerCase().includes(termoBusca)) ||
                      (item.codigo && item.codigo.toLowerCase().includes(termoBusca));
    return bateCategoria && bateBusca;
  });

  // Link para quando a pessoa não encontra a peça
  const linkDuvidaGeral = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá Auto Peças Camel! Não encontrei a peça que estou procurando no catálogo. Vocês têm em estoque?"
  )}`;

  return (
    <div className="container" style={{ paddingBottom: totalItensCarrinho > 0 ? "90px" : "20px" }}>
      
      {/* Busca rápida */}
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Buscar peça ou código..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="search-input"
        />
      </div>

      {/* BANNER: Não encontrou o que procura? */}
      <div className="whatsapp-banner">
        <div className="whatsapp-banner-text">
          <strong>Não encontrou a peça que procura?</strong>
          <span>Fale direto com nossos vendedores e consulte o estoque!</span>
        </div>
        <a
          href={linkDuvidaGeral}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp-banner"
        >
          💬 Consultar Vendedor
        </a>
      </div>

      {/* Categorias Dinâmicas (Renderizadas a partir do Banco de Dados) */}
      <div className="categories-flex">
        {categoriasExibicao.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaAtiva(cat.id)}
            className={`cat-btn ${categoriaAtiva === cat.id ? 'active' : ''}`}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      {/* Grid de Produtos */}
      {produtosFiltrados.length > 0 ? (
        <div className="products-grid">
          {produtosFiltrados.map((item) => {
            const itemNoCarrinho = carrinho.find((c) => c.id === item.id);
            const qtdNoCarrinho = itemNoCarrinho ? itemNoCarrinho.quantidade : 0;
            const precoFormatado = formatarPreco(item.preco);

            return (
              <div 
                key={item.id} 
                className="product-card"
                onClick={() => setProdutoSelecionado(item)}
              >
                <div className="image-container">
                  <img src={item.imagem} alt={item.nome} className="product-image" />
                  <span className="product-code">{item.codigo}</span>
                </div>

                <div className="product-info">
                  <div>
                    <h2 className="product-name">{item.nome}</h2>

                    {/* EXIBIÇÃO DO PREÇO NO CARD (QUANDO PREENCHIDO) */}
                    {precoFormatado && (
                      <div style={{ 
                        fontSize: "15px", 
                        fontWeight: "800", 
                        color: "#2563eb", 
                        marginTop: "4px" 
                      }}>
                        {precoFormatado}
                      </div>
                    )}
                  </div>

                  <span className="click-hint">Ver detalhes ➔</span>

                  {/* BOTÃO ADICIONAR / CONTROLE DE QUANTIDADE NO CARD */}
                  <div style={{ marginTop: "10px" }} onClick={(e) => e.stopPropagation()}>
                    {qtdNoCarrinho > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f1f5f9", padding: "6px", borderRadius: "8px", border: "1px solid #10b981" }}>
                        <button 
                          onClick={() => alterarQuantidade(item.id, -1)}
                          style={{ padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          -
                        </button>
                        <span style={{ color: "#0f172a", fontWeight: "bold", fontSize: "13px" }}>
                          {qtdNoCarrinho} no carrinho
                        </span>
                        <button 
                          onClick={() => alterarQuantidade(item.id, 1)}
                          style={{ padding: "6px 12px", background: "#10b981", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => adicionarAoCarrinho(item)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          backgroundColor: "#10b981",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px"
                        }}
                      >
                        🛒 Adicionar ao Orçamento
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p>Nenhuma peça encontrada.</p>
        </div>
      )}

      {/* --- BARRA FLUTUANTE DO CARRINHO NO RODAPÉ --- */}
      {totalItensCarrinho > 0 && (
        <div 
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#10b981",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "50px",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            zIndex: 999,
            cursor: "pointer",
            width: "90%",
            maxWidth: "400px",
            justifyContent: "space-between"
          }}
          onClick={() => setModalCarrinhoAberto(true)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>🛒</span>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                {totalItensCarrinho} {totalItensCarrinho === 1 ? "item selecionado" : "itens selecionados"}
              </div>
              <span style={{ fontSize: "11px", opacity: 0.9 }}>Clique para ver a lista</span>
            </div>
          </div>
          <button 
            style={{
              backgroundColor: "#fff",
              color: "#047857",
              border: "none",
              padding: "6px 14px",
              borderRadius: "20px",
              fontWeight: "bold",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            Ver Lista ➔
          </button>
        </div>
      )}

      {/* --- MODAL DA LISTA DO CARRINHO --- */}
      {modalCarrinhoAberto && (
        <div className="modal-overlay" onClick={() => setModalCarrinhoAberto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", width: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>🛒 Meu Orçamento</h2>
              <button className="modal-close" onClick={() => setModalCarrinhoAberto(false)}>✕</button>
            </div>

            {carrinho.length === 0 ? (
              <p style={{ color: "#64748b", textAlign: "center", padding: "20px 0" }}>Seu carrinho está vazio.</p>
            ) : (
              <div>
                <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "20px" }}>
                  {carrinho.map((item) => {
                    const precoItem = formatarPreco(item.preco);

                    return (
                      <div 
                        key={item.id} 
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between", 
                          padding: "10px 0", 
                          borderBottom: "1px solid #e2e8f0" 
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                          <img src={item.imagem} alt={item.nome} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                          <div>
                            <div style={{ color: "#0f172a", fontSize: "13px", fontWeight: "bold" }}>{item.nome}</div>
                            <div style={{ color: "#64748b", fontSize: "11px" }}>
                              Cód: {item.codigo || 'N/A'} {precoItem ? `• ${precoItem}` : ''}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button 
                            onClick={() => alterarQuantidade(item.id, -1)}
                            style={{ width: "26px", height: "26px", background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                          >
                            -
                          </button>
                          <span style={{ color: "#0f172a", fontWeight: "bold", minWidth: "20px", textAlign: "center" }}>{item.quantidade}</span>
                          <button 
                            onClick={() => alterarQuantidade(item.id, 1)}
                            style={{ width: "26px", height: "26px", background: "#e2e8f0", color: "#0f172a", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                          >
                            +
                          </button>
                          <button 
                            onClick={() => removerDoCarrinho(item.id)}
                            style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", marginLeft: "6px", fontSize: "16px" }}
                            title="Remover"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                  <button
                    onClick={() => {
                      enviarPedidoWhatsApp();
                      setModalCarrinhoAberto(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "14px",
                      backgroundColor: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "15px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    💬 Enviar Orçamento no WhatsApp
                  </button>

                  <button
                    onClick={limparCarrinho}
                    style={{
                      width: "100%",
                      padding: "8px",
                      backgroundColor: "transparent",
                      color: "#64748b",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    Esvaziar Lista
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE DETALHES DA PEÇA */}
      {produtoSelecionado && (
        <div className="modal-overlay" onClick={() => setProdutoSelecionado(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setProdutoSelecionado(null)}>✕</button>
            
            <div className="modal-header-compact">
              <img 
                src={produtoSelecionado.imagem} 
                alt={produtoSelecionado.nome} 
                className="modal-image-small" 
              />
              <div className="modal-title-box">
                <span className="product-code-badge">
                  Cód: {produtoSelecionado.codigo}
                </span>
                <h2 className="modal-title">{produtoSelecionado.nome}</h2>
                
                {/* PREÇO NO MODAL DE DETALHES */}
                {formatarPreco(produtoSelecionado.preco) && (
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#2563eb", marginTop: "4px" }}>
                    {formatarPreco(produtoSelecionado.preco)}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-description">
              <h3>Resumo da Peça / Aplicação:</h3>
              <p>{produtoSelecionado.descricao || "Sem resumo disponível para esta peça."}</p>
            </div>

            <button
              onClick={() => {
                adicionarAoCarrinho(produtoSelecionado);
                setProdutoSelecionado(null);
                setModalCarrinhoAberto(true);
              }}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              🛒 Adicionar ao Orçamento
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
