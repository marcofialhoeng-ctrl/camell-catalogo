import React, { useState } from 'react';

const categorias = [
  { id: 'todas', nome: 'Todas as Peças' },
  { id: 'automotiva', nome: 'Peças Automotivas' },
  { id: 'caminhao', nome: 'Caminhão & Ônibus' },
  { id: 'estetica', nome: 'Estética & Limpeza' }, // <--- NOVA CATEGORIA
  { id: 'ferramentas', nome: 'Ferramentas' },
  { id: 'eletrica-oleos', nome: 'Elétrica & Óleos' },
];

export default function CatalogoCliente({ produtos = [] }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const [busca, setBusca] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  // Número do WhatsApp da loja
  const whatsappNumber = "5532999842634";

  const produtosFiltrados = produtos.filter((item) => {
    const bateCategoria = categoriaAtiva === 'todas' || item.categoria === categoriaAtiva;
    const termoBusca = busca.toLowerCase().trim();
    const bateBusca = item.nome.toLowerCase().includes(termoBusca) ||
                      item.codigo.toLowerCase().includes(termoBusca);
    return bateCategoria && bateBusca;
  });

  const gerarLinkWhatsapp = (nome, codigo) => {
    const msg = `Olá Auto Peças Camel! Tenho interesse na peça: *${nome}* (Cód: ${codigo}). Qual o valor?`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  // Link para quando a pessoa não encontra a peça
  const linkDuvidaGeral = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá Auto Peças Camel! Não encontrei a peça que estou procurando no catálogo. Vocês têm em estoque?"
  )}`;

  return (
    <div className="container">
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

      {/* Categorias (Deslizável no celular) */}
      <div className="categories-flex">
        {categorias.map((cat) => (
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
          {produtosFiltrados.map((item) => (
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
                <h2 className="product-name">{item.nome}</h2>
                <span className="click-hint">Ver detalhes e resumo ➔</span>

                <a
                  href={gerarLinkWhatsapp(item.nome, item.codigo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  onClick={(e) => e.stopPropagation()}
                >
                  💬 Consultar no WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Nenhuma peça encontrada.</p>
        </div>
      )}

      {/* MODAL OTIMIZADO PARA CELULAR */}
      {produtoSelecionado && (
        <div className="modal-overlay" onClick={() => setProdutoSelecionado(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setProdutoSelecionado(null)}>✕</button>
            
            {/* Header Compacto com Foto Pequena e Título ao Lado */}
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
              </div>
            </div>

            {/* Resumo/Descrição */}
            <div className="modal-description">
              <h3>Resumo da Peça / Aplicação:</h3>
              <p>{produtoSelecionado.descricao || "Sem resumo disponível para esta peça."}</p>
            </div>

            {/* Botão de Ação Destacado */}
            <a
              href={gerarLinkWhatsapp(produtoSelecionado.nome, produtoSelecionado.codigo)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp btn-whatsapp-large"
            >
              💬 Tirar Dúvidas / Fazer Orçamento
            </a>
          </div>
        </div>
      )}
    </div>
  );
}