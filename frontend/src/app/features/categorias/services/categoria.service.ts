import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria, CategoriaRequest } from '../models/categoria';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  /** RNF15 - URL da API definida em uma única constante. */
  private readonly API = '/api/categorias';
  private readonly http = inject(HttpClient);

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.API);
  }

  buscar(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.API}/${id}`);
  }

  criar(dados: CategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(this.API, dados);
  }

  atualizar(id: number, dados: CategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.API}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
