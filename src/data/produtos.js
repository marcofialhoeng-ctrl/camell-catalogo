// Telefone da loja (com código do país 55 + DDD + Número)
const TELEFONE_LOJA = "32999842634"; 

export const categorias = [
  { id: 'todas', nome: 'Todas as Peças' },
  { id: 'automotiva', nome: 'Peças Automotivas' },
  { id: 'caminhao', nome: 'Caminhão & Ônibus' },
  { id: 'ferramentas', nome: 'Ferramentas' },
  { id: 'eletrica-oleos', nome: 'Elétrica & Óleos' },
];

/**
 * Função para gerar a URL direta do WhatsApp com mensagem personalizada
 */
export function gerarLinkWhatsapp(produto) {
  const mensagem = `Olá! Vi o produto *${produto.nome}* (Cód: ${produto.codigo}) no catálogo e gostaria de consultar a disponibilidade e o valor.`;
  const mensagemCodificada = encodeURIComponent(mensagem);
  return `https://wa.me/${TELEFONE_LOJA}?text=${mensagemCodificada}`;
}

export const produtos = [
  // PEÇAS AUTOMOTIVAS
  {
    id: 1,
    nome: 'Jogo de Pastilhas de Freio Dianteira',
    categoria: 'automotiva',
    codigo: 'PF-2024',
    imagem: 'https://placehold.co/400x300/18181b/f59e0b?text=Pastilha+de+Freio'
  },
  {
    id: 2,
    nome: 'Amortecedor Dianteiro Cofap',
    categoria: 'automotiva',
    codigo: 'AMT-102',
    imagem: 'https://placehold.co/400x300/18181b/f59e0b?text=Amortecedor'
  },

  // CAMINHÃO & ÔNIBUS
  {
    id: 3,
    nome: 'Tambor de Freio Scania / Volvo',
    categoria: 'caminhao',
    codigo: 'TB-8800',
    imagem: 'https://placehold.co/400x300/18181b/f59e0b?text=Tambor+de+Freio'
  },
  {
    id: 4,
    nome: 'Filtro de Ar Motor Diesel',
    categoria: 'caminhao',
    codigo: 'FA-990',
    imagem: 'https://placehold.co/400x300/18181b/f59e0b?text=Filtro+de+Ar'
  },

  // FERRAMENTAS
  {
    id: 5,
    nome: 'Chave de Roda Cruz Reforçada',
    categoria: 'ferramentas',
    codigo: 'FER-012',
    imagem: 'https://placehold.co/400x300/18181b/f59e0b?text=Chave+de+Roda'
  },

  // ELÉTRICA & ÓLEOS
  {
    id: 6,
    nome: 'Óleo Lubrificante 15W40 Mineral (4L)',
    categoria: 'eletrica-oleos',
    codigo: 'OL-1540',
    imagem: 'https://placehold.co/400x300/18181b/f59e0b?text=Oleo+15W40'
  },
  {
    id: 7,
    nome: 'Bateria Automotiva 60Ah 12V',
    categoria: 'eletrica-oleos',
    codigo: 'BAT-60',
    imagem: 'https://placehold.co/400x300/18181b/f59e0b?text=Bateria+60Ah'
  },
];