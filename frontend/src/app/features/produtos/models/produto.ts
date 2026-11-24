export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  imagemUrl: string | null;
  ativo: boolean;
  categoriaId: number;
  categoriaNome: string;
}

export interface ProdutoRequest {
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  imagemUrl: string | null;
  categoriaId: number;
  ativo: boolean;
}

export interface FiltroProduto {
  nome?: string;
  categoriaId?: number | null;
  ativo?: boolean | null;
  page?: number;
  size?: number;
  sort?: string;
}
