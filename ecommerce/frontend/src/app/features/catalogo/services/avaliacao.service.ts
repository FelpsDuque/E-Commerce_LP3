import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avaliacao, AvaliacaoRequest, ResumoAvaliacoes } from '../models/avaliacao';

/** RF09 - Avaliações são sub-recurso do produto: /api/produtos/{id}/avaliacoes */
@Injectable({ providedIn: 'root' })
export class AvaliacaoService {
  private readonly API = '/api/produtos';
  private readonly http = inject(HttpClient);

  listar(produtoId: number): Observable<ResumoAvaliacoes> {
    return this.http.get<ResumoAvaliacoes>(`${this.API}/${produtoId}/avaliacoes`);
  }

  avaliar(produtoId: number, dados: AvaliacaoRequest): Observable<Avaliacao> {
    return this.http.post<Avaliacao>(`${this.API}/${produtoId}/avaliacoes`, dados);
  }
}
