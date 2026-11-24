/** Espelha o ErroResponse do backend. */
export interface ErroApi {
  timestamp: string;
  status: number;
  erro: string;
  mensagem: string;
  caminho: string;
  campos?: { campo: string; mensagem: string }[];
}
