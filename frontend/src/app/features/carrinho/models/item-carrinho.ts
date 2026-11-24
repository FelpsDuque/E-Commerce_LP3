/** Item mantido no carrinho (somente no navegador, até a finalização). */
export interface ItemCarrinho {
  produtoId: number;
  nome: string;
  imagemUrl: string | null;
  precoUnitario: number;
  quantidade: number;
  estoqueDisponivel: number;
}
