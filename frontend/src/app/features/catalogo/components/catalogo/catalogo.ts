import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { ProdutoService } from '../../../produtos/services/produto.service';
import { Produto } from '../../../produtos/models/produto';
import { CategoriaService } from '../../../categorias/services/categoria.service';
import { Categoria } from '../../../categorias/models/categoria';
import { CarrinhoService } from '../../../carrinho/services/carrinho.service';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';
import { EstadoVazio } from '../../../../shared/components/estado-vazio';

/** RF03 - Catálogo com busca por nome e filtro por categoria (somente produtos ativos). */
@Component({
  selector: 'app-catalogo',
  imports: [
    ReactiveFormsModule, RouterLink, CurrencyPipe, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressBarModule, EstadoVazio,
  ],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss',
})
export class Catalogo implements OnInit {
  /** Query param opcional: /catalogo?categoriaId=1 (links da página inicial). */
  readonly categoriaId = input<string>();

  private readonly produtoService = inject(ProdutoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly carrinho = inject(CarrinhoService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly produtos = signal<Produto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly total = signal(0);
  readonly carregando = signal(false);
  pagina = 0;
  readonly tamanho = 12;

  readonly totalPaginas = computed(() => Math.ceil(this.total() / this.tamanho));
  readonly paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i));

  readonly filtros = inject(FormBuilder).nonNullable.group({
    nome: '',
    categoriaId: null as number | null,
    sort: 'nome,asc',
  });

  ngOnInit(): void {
    const id = this.categoriaId();
    if (id) this.filtros.patchValue({ categoriaId: +id }, { emitEvent: false });
    this.categoriaService.listar().subscribe((c) => this.categorias.set(c));
    this.filtros.valueChanges
      .pipe(
        debounceTime(350),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.pagina = 0;
        this.carregar();
      });
    this.carregar();
  }

  carregar(): void {
    const f = this.filtros.getRawValue();
    this.carregando.set(true);
    this.produtoService
      .listar({ ...f, ativo: true, page: this.pagina, size: this.tamanho })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (p) => {
          this.produtos.set(p.conteudo);
          this.total.set(p.totalElementos);
        },
        error: (e) => this.notificacao.erro(e, 'Erro ao carregar o catálogo.'),
      });
  }

  filtrarCategoria(id: number | null): void {
    this.filtros.controls.categoriaId.setValue(id);
  }

  irPara(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas() || pagina === this.pagina) return;
    this.pagina = pagina;
    this.carregar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  adicionar(p: Produto): void {
    if (this.carrinho.adicionar(p)) {
      this.notificacao.sucesso(`"${p.nome}" adicionado ao carrinho.`);
    } else {
      this.notificacao.erro(null, `Estoque insuficiente: só há ${p.estoque} unidade(s) de "${p.nome}".`);
    }
  }
}
