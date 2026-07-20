import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const categorias = [
  { id: 'automotiva', nome: 'Peças Automotivas' },
  { id: 'caminhao', nome: 'Caminhão & Ônibus' },
  { id: 'estetica', nome: 'Estética & Limpeza' },
  { id: 'ferramentas', nome: 'Ferramentas' },
  { id: 'eletrica-oleos', nome: 'Elétrica & Óleos' },
];

export default function PainelAdmin({ produtos = [], buscarProdutos }) {
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [categoria, setCategoria] = useState('automotiva');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState('');
  
  // Estado para controlar a edição
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Preenche o formulário para edição
  const iniciarEdicao = (prod) => {
    setProdutoEditando(prod);
    setNome(prod.nome);
    setCodigo(prod.codigo);
    setCategoria(prod.categoria);
    setDescricao(prod.descricao || '');
    setImagem(prod.imagem);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Limpa o formulário
  const cancelarEdicao = () => {
    setProdutoEditando(null);
    setNome('');
    setCodigo('');
    setCategoria('automotiva');
    setDescricao('');
    setImagem('');
  };

  // Salva no Supabase (cria novo ou atualiza)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !codigo || !imagem) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setEnviando(true);

    try {
      if (produtoEditando) {
        // ATUALIZA A PEÇA
        const { error } = await supabase
          .from('produtos')
          .update({
            nome,
            codigo,
            categoria,
            descricao,
            imagem,
          })
          .eq('id', produtoEditando.id);

        if (error) throw error;
        alert('Peça atualizada com sucesso!');
      } else {
        // CADASTRAR NOVA
        const { error } = await supabase.from('produtos').insert([
          { nome, codigo, categoria, descricao, imagem }
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
            <label>Categoria *</label>
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
            <label>URL / Link da Foto *</label>
            <input
              type="text"
              className="form-input"
              value={imagem}
              onChange={(e) => setImagem(e.target.value)}
              placeholder="Link da imagem no Supabase Storage"
            />
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
                ? 'Salvando...'
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

              {/* BOTOES DE AÇÃO */}
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