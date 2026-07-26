import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function PainelAdmin({ 
  produtos = [], 
  buscarProdutos, 
  categorias = [], 
  buscarCategorias 
}) {
  // Estados para Produtos
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [categoria, setCategoria] = useState(categorias[0]?.id || 'automotiva');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);

  // Estados de Controle de Edição e Envio
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Estados para Gerenciamento de Categorias / Abas
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  const [salvandoCategoria, setSalvandoCategoria] = useState(false);

  // Preenche o formulário para edição de produto
  const iniciarEdicao = (prod) => {
    setProdutoEditando(prod);
    setNome(prod.nome);
    setCodigo(prod.codigo);
    setCategoria(prod.categoria);
    setDescricao(prod.descricao || '');
    setImagem(prod.imagem);
    setImagemArquivo(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Limpa o formulário de produto
  const cancelarEdicao = () => {
    setProdutoEditando(null);
    setNome('');
    setCodigo('');
    setCategoria(categorias[0]?.id || 'automotiva');
    setDescricao('');
    setImagem('');
    setImagemArquivo(null);
  };

  // Funções de Gerenciamento de Categorias / Abas
  const handleAdicionarCategoria = async (e) => {
    e.preventDefault();
    if (!novaCategoriaNome.trim()) {
      alert('Digite o nome da nova categoria.');
      return;
    }

    setSalvandoCategoria(true);
    try {
      // Gera um ID amigável sem acentos/espaços (ex: "🔥 Promoções" -> "promocoes")
      const idGerado = novaCategoriaNome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const { error } = await supabase.from('categorias').insert([
        { id: idGerado || `cat-${Date.now()}`, nome: novaCategoriaNome.trim() }
      ]);

      if (error) throw error;

      alert('Nova categoria criada com sucesso!');
      setNovaCategoriaNome('');
      if (buscarCategorias) await buscarCategorias();
    } catch (error) {
      alert('Erro ao criar categoria: ' + error.message);
    } finally {
      setSalvandoCategoria(false);
    }
  };

  const handleDeletarCategoria = async (catId, catNome) => {
    if (catId === 'todas') {
      alert('A categoria "Todas as Peças" não pode ser excluída.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a aba "${catNome}"? Produtos associados a ela ficarão sem categoria definida.`)) {
      try {
        const { error } = await supabase.from('categorias').delete().eq('id', catId);
        if (error) throw error;

        alert('Categoria removida!');
        if (buscarCategorias) await buscarCategorias();
      } catch (error) {
        alert('Erro ao excluir categoria: ' + error.message);
      }
    }
  };

  // Salva Produto no Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nome || !codigo || (!produtoEditando && !imagemArquivo)) {
      alert('Por favor, preencha os campos obrigatórios e selecione uma imagem.');
      return;
    }

    setEnviando(true);

    try {
      let urlImagemFinal = imagem;

      if (imagemArquivo) {
        const extensao = imagemArquivo.name.split('.').pop();
        const nomeArquivo = `${Date.now()}_${Math.random().toString(36).substring(2)}.${extensao}`;

        const { error: uploadError } = await supabase.storage
          .from('Produtos')
          .upload(nomeArquivo, imagemArquivo);

        if (uploadError) {
          throw new Error('Erro ao enviar foto: ' + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from('Produtos')
          .getPublicUrl(nomeArquivo);

        urlImagemFinal = urlData.publicUrl;
      }

      if (produtoEditando) {
        const { error } = await supabase
          .from('produtos')
          .update({
            nome,
            codigo,
            categoria,
            descricao,
            imagem: urlImagemFinal,
          })
          .eq('id', produtoEditando.id);

        if (error) throw error;
        alert('Peça atualizada com sucesso!');
      } else {
        const { error } = await supabase.from('produtos').insert([
          {
            nome,
            codigo,
            categoria,
            descricao,
            imagem: urlImagemFinal,
          }
        ]);

        if (error) throw error;
        alert('Peça cadastrada com sucesso!');
      }

      cancelarEdicao();
      if (buscarProdutos) buscarProdutos();
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleDeletar = async (id, nomePeca) => {
    if (window.confirm(`Tem certeza que deseja excluir "${nomePeca}"?`)) {
      try {
        const { error } = await supabase.from('produtos').delete().eq('id', id);
        if (error) throw error;
        alert('Peça excluída com sucesso!');
        if (buscarProdutos) buscarProdutos();
      } catch (error) {
        alert('Erro ao excluir: ' + error.message);
      }
    }
  };

  return (
    <div className="container">

      {/* --- SEÇÃO 1: GERENCIAR CATEGORIAS / ABAS --- */}
      <div className="admin-panel" style={{ marginBottom: "24px", border: "1px solid #333" }}>
        <h2 className="admin-title" style={{ fontSize: "16px", marginBottom: "12px" }}>
          🏷️ Gerenciar Categorias & Abas do Catálogo
        </h2>

        {/* Formulário para Nova Categoria */}
        <form onSubmit={handleAdicionarCategoria} style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ex: 🔥 Promoções, Kit Filtros, Lançamentos..."
            value={novaCategoriaNome}
            onChange={(e) => setNovaCategoriaNome(e.target.value)}
            style={{ flex: 1, minWidth: "200px" }}
          />
          <button 
            type="submit" 
            className="btn-submit" 
            disabled={salvandoCategoria}
            style={{ width: "auto", padding: "0 20px" }}
          >
            {salvandoCategoria ? 'Criando...' : '➕ Criar Aba'}
          </button>
        </form>

        {/* Lista de Categorias Cadastradas */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {categorias.map((cat) => (
            <div 
              key={cat.id} 
              style={{ 
                background: "#2a2a2a", 
                padding: "6px 12px", 
                borderRadius: "20px", 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                fontSize: "12px",
                color: "#fff",
                border: "1px solid #444"
              }}
            >
              <span>{cat.nome}</span>
              {cat.id !== 'todas' && (
                <button
                  onClick={() => handleDeletarCategoria(cat.id, cat.nome)}
                  style={{ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", fontWeight: "bold", padding: "0 2px" }}
                  title="Excluir Categoria"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- SEÇÃO 2: CADASTRAR / EDITAR PRODUTOS --- */}
      <div className="admin-panel">
        <h2 className="admin-title">
          {produtoEditando ? '✏️ Editar Peça' : '➕ Cadastrar Nova Peça'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome da Peça *</label>
            <input
              type="text"
              className="form-input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Cera Automotiva"
            />
          </div>

          <div className="form-group">
            <label>Código da Peça *</label>
            <input
              type="text"
              className="form-input"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: EST-1020"
            />
          </div>

          <div className="form-group">
            <label>Categoria / Aba *</label>
            <select
              className="form-select"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Foto da Peça (Galeria / Dispositivo) *</label>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              onChange={(e) => setImagemArquivo(e.target.files[0])}
            />
            {produtoEditando && !imagemArquivo && (
              <span style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '4px', display: 'block' }}>
                (Deixe em branco para manter a foto atual)
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Resumo / Aplicação / Descrição</label>
            <textarea
              className="form-input"
              rows="3"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição do produto..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="actions-row">
            <button type="submit" className="btn-submit" disabled={enviando}>
              {enviando
                ? 'Enviando e Salvando...'
                : produtoEditando
                ? '💾 Salvar Alterações'
                : '➕ Cadastrar Peça'}
            </button>

            {produtoEditando && (
              <button
                type="button"
                className="btn-submit"
                onClick={cancelarEdicao}
                style={{ backgroundColor: '#3f3f46', color: '#fff' }}
              >
                ✕ Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- SEÇÃO 3: LISTAGEM DE PRODUTOS --- */}
      <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#a1a1aa' }}>
        Peças Cadastradas ({produtos.length})
      </h3>

      <div className="products-grid">
        {produtos.map((item) => (
          <div key={item.id} className="product-card">
            <div className="image-container">
              <img src={item.imagem} alt={item.nome} className="product-image" />
              <span className="product-code">{item.codigo}</span>
            </div>

            <div className="product-info">
              <h2 className="product-name">{item.nome}</h2>

              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <button
                  onClick={() => iniciarEdicao(item)}
                  style={{
                    flex: 1,
                    backgroundColor: '#f59e0b',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  ✏️ Editar
                </button>

                <button
                  onClick={() => handleDeletar(item.id, item.nome)}
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
