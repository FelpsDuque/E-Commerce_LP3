import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProdutoMaisVendido } from '../models/produto-mais-vendido';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private readonly API = '/api/relatorios';
  private readonly http = inject(HttpClient);

  /** RF10 - datas no formato yyyy-MM-dd */
  maisVendidos(inicio: string, fim: string, limite = 10): Observable<ProdutoMaisVendido[]> {
    const params = new HttpParams().set('inicio', inicio).set('fim', fim).set('limite', limite);
    return this.http.get<ProdutoMaisVendido[]>(`${this.API}/mais-vendidos`, { params });
  }
}
