import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { finalize } from 'rxjs';
import { ProdutoService } from '../../../produtos/services/produto.service';
import { Produto } from '../../../produtos/models/produto';
import { AvaliacaoService } from '../../services/avaliacao.service';
import { ResumoAvaliacoes } from '../../models/avaliacao';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { Cliente } from '../../../clientes/models/cliente';
import { CarrinhoService } from '../../../carrinho/services/carrinho.service';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';
import { EstadoVazio } from '../../../../shared/components/estado-vazio';

/** Detalhe do produto + RF09 (avaliações). */
@Component({
  selector: 'app-produto-detalhe',
  imports: [
    ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, DecimalPipe, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressBarModule, MatDividerModule, EstadoVazio,
  ],
  templateUrl: './produto-detalhe.html',
  styleUrl: './produto-detalhe.scss',
})
export class ProdutoDetalhe implements OnInit {
  readonly id = input.required<string>();

  private readonly produtoService = inject(ProdutoService);
  private readonly avaliacaoService = inject(AvaliacaoService);
  private readonly clienteService = inject(ClienteService);
  private readonly carrinho = inject(CarrinhoService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly fb = inject(FormBuilder);

  readonly produto = signal<Produto | null>(null);
  readonly resumo = signal<ResumoAvaliacoes | null>(null);
  readonly clientes = signal<Cliente[]>([]);
  readonly carregando = signal(true);
  readonly enviando = signal(false);
  readonly estrelas = [1, 2, 3, 4, 5];

  readonly quantidade = this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]);

  readonly formAvaliacao = this.fb.nonNullable.group({
    clienteId: [null as number | null, Validators.required],
    nota: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comentario: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    this.produtoService
      .buscar(+this.id())
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (p) => {
          this.produto.set(p);
          this.quantidade.addValidators(Validators.max(p.estoque));
        },
        error: (e) => this.notificacao.erro(e),
      });
    this.carregarAvaliacoes();
    this.clienteService.listarTodos().subscribe((p) => this.clientes.set(p.conteudo));
  }

  carregarAvaliacoes(): void {
    this.avaliacaoService.listar(+this.id()).subscribe({
      next: (r) => this.resumo.set(r),
      error: () => this.resumo.set(null),
    });
  }

  adicionar(): void {
    const p = this.produto();
    if (!p || this.quantidade.invalid) return;
    if (this.carrinho.adicionar(p, this.quantidade.value)) {
      this.notificacao.sucesso(`${this.quantidade.value}x "${p.nome}" adicionado ao carrinho.`);
    } else {
      this.notificacao.erro(null, `Estoque insuficiente: disponível ${p.estoque} (considerando o que já está no carrinho).`);
    }
  }

  avaliar(): void {
    if (this.formAvaliacao.invalid) {
      this.formAvaliacao.markAllAsTouched();
      return;
    }
    const v = this.formAvaliacao.getRawValue();
    this.enviando.set(true);
    this.avaliacaoService
      .avaliar(+this.id(), { clienteId: v.clienteId!, nota: v.nota, comentario: v.comentario || null })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.notificacao.sucesso('Avaliação registrada. Obrigado!');
          this.formAvaliacao.reset({ clienteId: null, nota: 5, comentario: '' });
          this.carregarAvaliacoes();
        },
        error: (e) => this.notificacao.erro(e),
      });
  }
}
