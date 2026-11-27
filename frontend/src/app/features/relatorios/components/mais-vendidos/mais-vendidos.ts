import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { RelatorioService } from '../../services/relatorio.service';
import { ProdutoMaisVendido } from '../../models/produto-mais-vendido';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';
import { EstadoVazio } from '../../../../shared/components/estado-vazio';

function paraIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** RF10 - Produtos mais vendidos no período (pedidos cancelados não contam). */
@Component({
  selector: 'app-mais-vendidos',
  imports: [
    ReactiveFormsModule, CurrencyPipe, MatFormFieldModule, MatInputModule, MatDatepickerModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, RouterLink, EstadoVazio,
  ],
  templateUrl: './mais-vendidos.html',
  styles: `
    .receita { margin: 0 0 24px; }
    .valor { color: var(--gs-tinta); font-family: var(--gs-titulo); font-size: 20px; }
    .ranking { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--gs-tinta); }
    .ranking li { display: flex; gap: 24px; align-items: center; padding: 20px 0; border-bottom: 1px solid var(--gs-linha); }
    .posicao { font-family: var(--gs-titulo); font-weight: 800; font-size: 32px; letter-spacing: -1px; width: 52px; flex: none; }
    .corpo { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
    .linha { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 8px 24px; }
    .nome { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .nome a { font-weight: 600; font-size: 16px; text-decoration: none; overflow-wrap: anywhere; }
    .nome a:hover { text-decoration: underline; }
    .numeros { display: flex; gap: 16px; align-items: baseline; white-space: nowrap; }
    .barra-fundo { background: var(--gs-superficie); border-radius: 2px; height: 8px; }
    .barra-valor { background: var(--gs-destaque); border-radius: 2px; height: 8px; min-width: 4px; }
  `,
})
export class MaisVendidos implements OnInit {
  private readonly service = inject(RelatorioService);
  private readonly notificacao = inject(NotificacaoService);

  readonly linhas = signal<ProdutoMaisVendido[]>([]);
  readonly carregando = signal(false);
  readonly maior = computed(() => Math.max(1, ...this.linhas().map((l) => l.quantidadeVendida)));
  readonly receitaTotal = computed(() => this.linhas().reduce((s, l) => s + l.receita, 0));

  readonly form = inject(FormBuilder).nonNullable.group({
    inicio: [this.diasAtras(60), Validators.required],
    fim: [new Date(), Validators.required],
  });

  ngOnInit(): void {
    this.gerar();
  }

  gerar(): void {
    if (this.form.invalid) return;
    const { inicio, fim } = this.form.getRawValue();
    this.carregando.set(true);
    this.service
      .maisVendidos(paraIso(inicio), paraIso(fim))
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (l) => this.linhas.set(l),
        error: (e) => this.notificacao.erro(e),
      });
  }

  private diasAtras(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  }
}
