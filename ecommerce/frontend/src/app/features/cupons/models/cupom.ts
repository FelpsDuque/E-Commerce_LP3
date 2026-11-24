export interface Cupom {
  id: number;
  codigo: string;
  percentual: number;
  validade: string; // yyyy-MM-dd
  ativo: boolean;
  valido: boolean;
}

export interface CupomRequest {
  codigo: string;
  percentual: number;
  validade: string;
  ativo: boolean;
}
