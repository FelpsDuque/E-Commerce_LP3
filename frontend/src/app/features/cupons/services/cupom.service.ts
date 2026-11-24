import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cupom, CupomRequest } from '../models/cupom';

@Injectable({ providedIn: 'root' })
export class CupomService {
  private readonly API = '/api/cupons';
  private readonly http = inject(HttpClient);

  listar(): Observable<Cupom[]> {
    return this.http.get<Cupom[]>(this.API);
  }

  buscar(id: number): Observable<Cupom> {
    return this.http.get<Cupom>(`${this.API}/${id}`);
  }

  buscarPorCodigo(codigo: string): Observable<Cupom> {
    return this.http.get<Cupom>(`${this.API}/codigo/${encodeURIComponent(codigo)}`);
  }

  criar(dados: CupomRequest): Observable<Cupom> {
    return this.http.post<Cupom>(this.API, dados);
  }

  atualizar(id: number, dados: CupomRequest): Observable<Cupom> {
    return this.http.put<Cupom>(`${this.API}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
