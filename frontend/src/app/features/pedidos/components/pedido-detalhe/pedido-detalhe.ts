import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { PedidoService } from '../../services/pedido.service';
import { PROXIMO_STATUS, Pedido, StatusPedido } from '../../models/pedido';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';
import { ConfirmacaoService } from '../../../../shared/services/confirmacao.service';
import { StatusPedidoPipe } from '../../../../shared/pipes/status-pedido.pipe';

/** Detalhe do pedido (RF06) e alteração de status (RF07 / RN03). */
@Component({
  selector: 'app-pedido-detalhe',
  imports: [RouterLink, CurrencyPipe, DatePipe, MatButtonModule, MatIconModule, MatTableModule, MatProgressBarModule, StatusPedidoPipe],
  templateUrl: './pedido-detalhe.html',
  styleUrl: './pedido-detalhe.scss',
})
export class PedidoDetalhe implements OnInit {
  readonly id = input.required<string>();

  private readonly service = inject(PedidoService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly confirmacao = inject(ConfirmacaoService);

  readonly pedido = signal<Pedido | null>(null);
  readonly carregando = signal(true);
  readonly colunas = ['produto', 'quantidade', 'precoUnitario', 'subtotal'];
  readonly etapas: StatusPedido[] = ['PENDENTE', 'PAGO', 'ENVIADO', 'ENTREGUE'];

  readonly proximo = computed(() => {
    const p = this.pedido();
    return p ? PROXIMO_STATUS[p.status] ?? null : null;
  });
  readonly podeCancelar = computed(() => ['PENDENTE', 'PAGO'].includes(this.pedido()?.status ?? ''));

  ngOnInit(): void {
    this.service
      .buscar(+this.id())
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (p) => this.pedido.set(p),
        error: (e) => this.notificacao.erro(e),
      });
  }

  etapaConcluida(etapa: StatusPedido): boolean {
    const p = this.pedido();
    if (!p || p.status === 'CANCELADO') return false;
    return this.etapas.indexOf(etapa) <= this.etapas.indexOf(p.status);
  }

  alterar(status: StatusPedido): void {
    const cancelar = status === 'CANCELADO';
    this.confirmacao
      .confirmar({
        titulo: cancelar ? 'Cancelar pedido' : 'Alterar status',
        mensagem: cancelar
          ? 'O pedido será cancelado e as quantidades voltarão ao estoque. Continuar?'
          : `Alterar o status do pedido para "${new StatusPedidoPipe().transform(status)}"?`,
        textoConfirmar: cancelar ? 'Cancelar pedido' : 'Confirmar',
        perigo: cancelar,
      })
      .subscribe((ok) => {
        if (!ok) return;
        this.carregando.set(true);
        this.service
          .alterarStatus(+this.id(), status)
          .pipe(finalize(() => this.carregando.set(false)))
          .subscribe({
            next: (p) => {
              this.pedido.set(p);
              this.notificacao.sucesso(`Status alterado para ${new StatusPedidoPipe().transform(p.status)}.`);
            },
            error: (e) => this.notificacao.erro(e),
          });
      });
  }
}
