import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { CarrinhoService } from '../../services/carrinho.service';
import { CarrinhoPainelService } from '../../services/carrinho-painel.service';
import { ItemCarrinho } from '../../models/item-carrinho';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { Cliente } from '../../../clientes/models/cliente';
import { CupomService } from '../../../cupons/services/cupom.service';
import { Cupom } from '../../../cupons/models/cupom';
import { PedidoService } from '../../../pedidos/services/pedido.service';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';
import { ConfirmacaoService } from '../../../../shared/services/confirmacao.service';
import { EstadoVazio } from '../../../../shared/components/estado-vazio';

/** RF04 (carrinho) e RF05 (finalizar pedido vinculado a um cliente). Exibido no painel lateral (app.html). */
@Component({
  selector: 'app-carrinho',
  imports: [
    ReactiveFormsModule, RouterLink, CurrencyPipe, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatProgressBarModule, EstadoVazio,
  ],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.scss',
})
export class Carrinho {
  readonly carrinho = inject(CarrinhoService);
  readonly painel = inject(CarrinhoPainelService);
  private readonly clienteService = inject(ClienteService);
  private readonly cupomService = inject(CupomService);
  private readonly pedidoService = inject(PedidoService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly confirmacao = inject(ConfirmacaoService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly clientes = signal<Cliente[]>([]);
  readonly cupom = signal<Cupom | null>(null);
  readonly finalizando = signal(false);

  readonly form = this.fb.nonNullable.group({
    clienteId: [null as number | null, Validators.required],
    codigoCupom: ['', [Validators.maxLength(30)]],
  });

  /** Prévia do desconto. O valor oficial é recalculado no backend. */
  readonly desconto = computed(() => {
    const c = this.cupom();
    return c ? Math.round(this.carrinho.total() * c.percentual) / 100 : 0;
  });
  readonly totalFinal = computed(() => this.carrinho.total() - this.desconto());

  constructor() {
    // Recarrega os clientes sempre que o painel abre (pode ter havido cadastro novo)
    effect(() => {
      if (this.painel.aberto()) this.carregarClientes();
    });
  }

  private carregarClientes(): void {
    this.clienteService.listarTodos().subscribe({
      next: (p) => this.clientes.set(p.conteudo),
      error: (e) => this.notificacao.erro(e, 'Erro ao carregar clientes.'),
    });
  }

  alterar(item: ItemCarrinho, quantidade: number): void {
    if (!Number.isInteger(quantidade) || quantidade < 1) return;
    if (quantidade > item.estoqueDisponivel) {
      this.notificacao.erro(null, `Só há ${item.estoqueDisponivel} unidade(s) de "${item.nome}".`);
      return;
    }
    this.carrinho.alterarQuantidade(item.produtoId, quantidade);
  }

  remover(item: ItemCarrinho): void {
    this.confirmacao
      .confirmar({ titulo: 'Remover item', mensagem: `Remover "${item.nome}" do carrinho?`, textoConfirmar: 'Remover', perigo: true })
      .subscribe((ok) => ok && this.carrinho.remover(item.produtoId));
  }

  aplicarCupom(): void {
    const codigo = this.form.controls.codigoCupom.value.trim().toUpperCase();
    if (!codigo) return;
    this.cupomService.buscarPorCodigo(codigo).subscribe({
      next: (c) => {
        if (!c.valido) {
          this.cupom.set(null);
          this.notificacao.erro(null, `O cupom ${c.codigo} está inativo ou expirado.`);
          return;
        }
        this.cupom.set(c);
        this.form.controls.codigoCupom.setValue(c.codigo);
        this.notificacao.sucesso(`Cupom ${c.codigo} aplicado: ${c.percentual}% de desconto.`);
      },
      error: (e) => {
        this.cupom.set(null);
        this.notificacao.erro(e, 'Cupom não encontrado.');
      },
    });
  }

  removerCupom(): void {
    this.cupom.set(null);
    this.form.controls.codigoCupom.setValue('');
  }

  finalizar(): void {
    if (this.form.invalid || this.carrinho.itens().length === 0) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.confirmacao
      .confirmar({ titulo: 'Finalizar pedido', mensagem: 'Confirmar a compra dos itens do carrinho?', textoConfirmar: 'Finalizar' })
      .subscribe((ok) => {
        if (!ok) return;
        this.finalizando.set(true);
        this.pedidoService
          .finalizar({
            clienteId: v.clienteId!,
            codigoCupom: this.cupom()?.codigo ?? null,
            itens: this.carrinho.itens().map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
          })
          .pipe(finalize(() => this.finalizando.set(false)))
          .subscribe({
            next: (pedido) => {
              this.carrinho.limpar();
              this.painel.fechar();
              this.notificacao.sucesso(`Pedido #${pedido.id} realizado com sucesso!`);
              this.router.navigate(['/pedidos', pedido.id]);
            },
            // RN01: se faltar estoque o backend devolve 409 com a lista de problemas
            error: (e) => this.notificacao.erro(e),
          });
      });
  }
}
