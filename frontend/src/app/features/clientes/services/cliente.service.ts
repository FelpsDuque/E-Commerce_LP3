import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagina } from '../../../shared/models/pagina';
import { Pedido } from '../../pedidos/models/pedido';
import { Cliente, ClienteRequest } from '../models/cliente';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly API = '/api/clientes';
  private readonly http = inject(HttpClient);

  listar(nome = '', page = 0, size = 10): Observable<Pagina<Cliente>> {
    const params = new HttpParams().set('nome', nome).set('page', page).set('size', size);
    return this.http.get<Pagina<Cliente>>(this.API, { params });
  }

  /** Lista curta para selects (carrinho, avaliação, filtro de pedidos). */
  listarTodos(): Observable<Pagina<Cliente>> {
    return this.listar('', 0, 100);
  }

  buscar(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.API}/${id}`);
  }

  criar(dados: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.API, dados);
  }

  atualizar(id: number, dados: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.API}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  /** RF06 - pedidos do cliente */
  pedidos(id: number, page = 0, size = 10): Observable<Pagina<Pedido>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Pagina<Pedido>>(`${this.API}/${id}/pedidos`, { params });
  }
}
