import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { PedidoService } from '../../services/pedido.service';
import { Pedido, STATUS_PEDIDO, StatusPedido } from '../../models/pedido';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { Cliente } from '../../../clientes/models/cliente';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';
import { EstadoVazio } from '../../../../shared/components/estado-vazio';
import { StatusPedidoPipe } from '../../../../shared/pipes/status-pedido.pipe';

/** RF06 - Consultar pedidos (filtro por cliente e status). */
@Component({
  selector: 'app-pedido-lista',
  imports: [
    ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressBarModule,
    EstadoVazio, StatusPedidoPipe,
  ],
  templateUrl: './pedido-lista.html',
})
export class PedidoLista implements OnInit {
  /** Query param opcional: /pedidos?clienteId=1 */
  readonly clienteId = input<string>();

  private readonly service = inject(PedidoService);
  private readonly clienteService = inject(ClienteService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pedidos = signal<Pedido[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly total = signal(0);
  readonly carregando = signal(false);
  readonly statusLista = STATUS_PEDIDO;
  readonly colunas = ['id', 'data', 'cliente', 'itens', 'total', 'status', 'acoes'];
  pagina = 0;
  tamanho = 10;

  readonly filtros = inject(FormBuilder).group({
    clienteId: null as number | null,
    status: null as StatusPedido | null,
  });

  ngOnInit(): void {
    const id = this.clienteId();
    if (id) this.filtros.patchValue({ clienteId: +id }, { emitEvent: false });
    this.clienteService.listarTodos().subscribe((p) => this.clientes.set(p.conteudo));
    this.filtros.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.pagina = 0;
      this.carregar();
    });
    this.carregar();
  }

  carregar(): void {
    const f = this.filtros.getRawValue();
    this.carregando.set(true);
    this.service
      .listar({ ...f, page: this.pagina, size: this.tamanho })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (p) => {
          this.pedidos.set(p.conteudo);
          this.total.set(p.totalElementos);
        },
        error: (e) => this.notificacao.erro(e, 'Erro ao carregar pedidos.'),
      });
  }

  mudarPagina(e: PageEvent): void {
    this.pagina = e.pageIndex;
    this.tamanho = e.pageSize;
    this.carregar();
  }

  qtdItens(p: Pedido): number {
    return p.itens.reduce((s, i) => s + i.quantidade, 0);
  }
}
