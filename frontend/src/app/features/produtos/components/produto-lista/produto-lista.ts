import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/produto';
import { CategoriaService } from '../../../categorias/services/categoria.service';
import { Categoria } from '../../../categorias/models/categoria';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';
import { ConfirmacaoService } from '../../../../shared/services/confirmacao.service';
import { EstadoVazio } from '../../../../shared/components/estado-vazio';

@Component({
  selector: 'app-produto-lista',
  imports: [
    ReactiveFormsModule, RouterLink, CurrencyPipe,
    MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule, EstadoVazio,
  ],
  templateUrl: './produto-lista.html',
  styles: `
    .miniatura { width: 48px; height: 48px; }
    .inativo { opacity: .55; }
  `,
})
export class ProdutoLista implements OnInit {
  private readonly service = inject(ProdutoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly confirmacao = inject(ConfirmacaoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly produtos = signal<Produto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly total = signal(0);
  readonly carregando = signal(false);
  readonly colunas = ['imagem', 'nome', 'categoria', 'preco', 'estoque', 'ativo', 'acoes'];

  pagina = 0;
  tamanho = 10;

  readonly filtros = inject(FormBuilder).nonNullable.group({
    nome: '',
    categoriaId: null as number | null,
    ativo: null as boolean | null,
  });

  ngOnInit(): void {
    this.categoriaService.listar().subscribe((c) => this.categorias.set(c));
    this.filtros.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pagina = 0;
        this.carregar();
      });
    this.carregar();
  }

  carregar(): void {
    const f = this.filtros.getRawValue();
    this.carregando.set(true);
    this.service
      .listar({ ...f, page: this.pagina, size: this.tamanho, sort: 'nome' })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (p) => {
          this.produtos.set(p.conteudo);
          this.total.set(p.totalElementos);
        },
        error: (e) => this.notificacao.erro(e, 'Erro ao carregar produtos.'),
      });
  }

  mudarPagina(e: PageEvent): void {
    this.pagina = e.pageIndex;
    this.tamanho = e.pageSize;
    this.carregar();
  }

  excluir(p: Produto): void {
    this.confirmacao
      .confirmar({
        titulo: 'Excluir produto',
        mensagem: `Deseja excluir "${p.nome}"? Se ele já constar em pedidos, será apenas inativado.`,
        textoConfirmar: 'Excluir',
        perigo: true,
      })
      .subscribe((ok) => {
        if (!ok) return;
        this.service.excluir(p.id).subscribe({
          next: (resp) => {
            // RN04: 200 + mensagem = inativado; 204 = excluído
            this.notificacao.sucesso(resp.body?.mensagem ?? 'Produto excluído.');
            this.carregar();
          },
          error: (e) => this.notificacao.erro(e),
        });
      });
  }
}
