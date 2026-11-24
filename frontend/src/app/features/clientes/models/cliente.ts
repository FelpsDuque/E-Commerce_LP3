export interface Cliente {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string | null;
  endereco: string | null;
}

export type ClienteRequest = Omit<Cliente, 'id'>;
