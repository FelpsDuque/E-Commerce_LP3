export type StatusPedido = 'PENDENTE' | 'PAGO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';

export const STATUS_PEDIDO: StatusPedido[] = ['PENDENTE', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'];

/** Mesma regra do backend (RN03), usada só para habilitar/desabilitar botões na tela. */
export const PROXIMO_STATUS: Partial<Record<StatusPedido, StatusPedido>> = {
  PENDENTE: 'PAGO',
  PAGO: 'ENVIADO',
  ENVIADO: 'ENTREGUE',
};

export interface ItemPedido {
  id: number;
  produtoId: number;
  produtoNome: string;
  imagemUrl: string | null;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  clienteId: number;
  clienteNome: string;
  dataPedido: string;
  status: StatusPedido;
  subtotal: number;
  desconto: number;
  total: number;
  codigoCupom: string | null;
  itens: ItemPedido[];
}

export interface PedidoRequest {
  clienteId: number;
  itens: { produtoId: number; quantidade: number }[];
  codigoCupom: string | null;
}
