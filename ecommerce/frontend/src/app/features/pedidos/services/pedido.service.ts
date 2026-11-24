import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagina } from '../../../shared/models/pagina';
import { Pedido, PedidoRequest, StatusPedido } from '../models/pedido';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly API = '/api/pedidos';
  private readonly http = inject(HttpClient);

  listar(filtro: { clienteId?: number | null; status?: StatusPedido | null; page?: number; size?: number }): Observable<Pagina<Pedido>> {
    let params = new HttpParams()
      .set('page', filtro.page ?? 0)
      .set('size', filtro.size ?? 10);
    if (filtro.clienteId) params = params.set('clienteId', filtro.clienteId);
    if (filtro.status) params = params.set('status', filtro.status);
    return this.http.get<Pagina<Pedido>>(this.API, { params });
  }

  buscar(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.API}/${id}`);
  }

  /** RF05 - finalizar pedido */
  finalizar(dados: PedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(this.API, dados);
  }

  /** RF07 - alterar status */
  alterarStatus(id: number, status: StatusPedido): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.API}/${id}/status`, { status });
  }
}
