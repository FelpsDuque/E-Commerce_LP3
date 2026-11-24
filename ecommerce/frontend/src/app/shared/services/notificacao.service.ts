import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErroApi } from '../models/erro-api';

/** RNF24 - Feedback visual padronizado (sucesso / erro) via SnackBar. */
@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly snackBar = inject(MatSnackBar);

  sucesso(mensagem: string): void {
    this.snackBar.open(mensagem, 'OK', { duration: 3500, panelClass: 'snack-sucesso' });
  }

  erro(erro: unknown, padrao = 'Não foi possível concluir a operação.'): void {
    this.snackBar.open(this.mensagemDe(erro, padrao), 'Fechar', {
      duration: 7000,
      panelClass: 'snack-erro',
    });
  }

  /** Extrai a mensagem em português devolvida pelo GlobalExceptionHandler do backend. */
  mensagemDe(erro: unknown, padrao = 'Erro inesperado.'): string {
    if (erro instanceof HttpErrorResponse) {
      if (erro.status === 0) {
        return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
      }
      const corpo = erro.error as ErroApi | null;
      if (corpo?.mensagem) {
        const campos = corpo.campos?.map((c) => c.mensagem).join(' ');
        return campos ? `${corpo.mensagem} ${campos}` : corpo.mensagem;
      }
    }
    return padrao;
  }
}
