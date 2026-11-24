import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagina } from '../../../shared/models/pagina';
import { FiltroProduto, Produto, ProdutoRequest } from '../models/produto';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly API = '/api/produtos';
  private readonly http = inject(HttpClient);

  /** Busca e filtros são feitos no backend (consulta paginada no banco). */
  listar(filtro: FiltroProduto = {}): Observable<Pagina<Produto>> {
    let params = new HttpParams();
    Object.entries(filtro).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(chave, String(valor));
      }
    });
    return this.http.get<Pagina<Produto>>(this.API, { params });
  }

  buscar(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.API}/${id}`);
  }

  criar(dados: ProdutoRequest): Observable<Produto> {
    return this.http.post<Produto>(this.API, dados);
  }

  atualizar(id: number, dados: ProdutoRequest): Observable<Produto> {
    return this.http.put<Produto>(`${this.API}/${id}`, dados);
  }

  /**
   * RN04 - 204 = excluído; 200 com { mensagem } = apenas inativado (já constava em pedidos).
   * observe: 'response' permite ler o status HTTP.
   */
  excluir(id: number): Observable<HttpResponse<{ mensagem: string } | null>> {
    return this.http.delete<{ mensagem: string } | null>(`${this.API}/${id}`, {
      observe: 'response',
    });
  }
}
