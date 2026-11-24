import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';
import { ConfirmacaoService } from '../../../../shared/services/confirmacao.service';
import { EstadoVazio } from '../../../../shared/components/estado-vazio';

@Component({
  selector: 'app-categoria-lista',
  imports: [RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule, EstadoVazio],
  templateUrl: './categoria-lista.html',
})
export class CategoriaLista implements OnInit {
  private readonly service = inject(CategoriaService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly confirmacao = inject(ConfirmacaoService);

  readonly categorias = signal<Categoria[]>([]);
  readonly carregando = signal(false);
  readonly colunas = ['nome', 'descricao', 'quantidadeProdutos', 'acoes'];

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.service
      .listar()
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (lista) => this.categorias.set(lista),
        error: (e) => this.notificacao.erro(e, 'Erro ao carregar categorias.'),
      });
  }

  excluir(c: Categoria): void {
    this.confirmacao
      .confirmar({
        titulo: 'Excluir categoria',
        mensagem: `Deseja excluir a categoria "${c.nome}"?`,
        textoConfirmar: 'Excluir',
        perigo: true,
      })
      .subscribe((ok) => {
        if (!ok) return;
        this.service.excluir(c.id).subscribe({
          next: () => {
            this.notificacao.sucesso('Categoria excluída.');
            this.carregar();
          },
          error: (e) => this.notificacao.erro(e),
        });
      });
  }
}
