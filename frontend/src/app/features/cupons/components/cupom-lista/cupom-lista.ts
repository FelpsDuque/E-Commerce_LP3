import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { CupomService } from '../../services/cupom.service';
import { Cupom } from '../../models/cupom';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';
import { ConfirmacaoService } from '../../../../shared/services/confirmacao.service';
import { EstadoVazio } from '../../../../shared/components/estado-vazio';

/** RF08 - Cupons de desconto. */
@Component({
  selector: 'app-cupom-lista',
  imports: [RouterLink, DatePipe, DecimalPipe, MatTableModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule, EstadoVazio],
  templateUrl: './cupom-lista.html',
})
export class CupomLista implements OnInit {
  private readonly service = inject(CupomService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly confirmacao = inject(ConfirmacaoService);

  readonly cupons = signal<Cupom[]>([]);
  readonly carregando = signal(false);
  readonly colunas = ['codigo', 'percentual', 'validade', 'situacao', 'acoes'];

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.service
      .listar()
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (c) => this.cupons.set(c),
        error: (e) => this.notificacao.erro(e, 'Erro ao carregar cupons.'),
      });
  }

  situacao(c: Cupom): string {
    if (!c.ativo) return 'Inativo';
    return c.valido ? 'Válido' : 'Expirado';
  }

  excluir(c: Cupom): void {
    this.confirmacao
      .confirmar({ titulo: 'Excluir cupom', mensagem: `Deseja excluir o cupom ${c.codigo}?`, textoConfirmar: 'Excluir', perigo: true })
      .subscribe((ok) => {
        if (!ok) return;
        this.service.excluir(c.id).subscribe({
          next: () => {
            this.notificacao.sucesso('Cupom excluído.');
            this.carregar();
          },
          error: (e) => this.notificacao.erro(e),
        });
      });
  }
}
