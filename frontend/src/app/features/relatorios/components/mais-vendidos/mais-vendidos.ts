import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
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
    MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule, EstadoVazio,
  ],
  templateUrl: './mais-vendidos.html',
  styles: `
    .barra-fundo { background: var(--mat-sys-surface-container-high); border-radius: 4px; height: 10px; min-width: 60px; }
    .barra-valor { background: var(--mat-sys-primary); border-radius: 4px; height: 10px; }
  `,
})
export class MaisVendidos implements OnInit {
  private readonly service = inject(RelatorioService);
  private readonly notificacao = inject(NotificacaoService);

  readonly linhas = signal<ProdutoMaisVendido[]>([]);
  readonly carregando = signal(false);
  readonly colunas = ['posicao', 'produto', 'categoria', 'quantidade', 'barra', 'receita'];
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
