export interface Avaliacao {
  id: number;
  clienteId: number;
  clienteNome: string;
  nota: number;
  comentario: string | null;
  data: string;
}

export interface ResumoAvaliacoes {
  media: number | null;
  total: number;
  avaliacoes: Avaliacao[];
}

export interface AvaliacaoRequest {
  clienteId: number;
  nota: number;
  comentario: string | null;
}
