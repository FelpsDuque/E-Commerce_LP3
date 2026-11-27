import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { ProdutoService } from '../../services/produto.service';
import { CategoriaService } from '../../../categorias/services/categoria.service';
import { Categoria } from '../../../categorias/models/categoria';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';

@Component({
  selector: 'app-produto-form',
  imports: [
    ReactiveFormsModule, RouterLink, CurrencyPipe, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatButtonModule, MatProgressBarModule,
  ],
  templateUrl: './produto-form.html',
  styles: `
    .layout {
      display: grid; gap: 40px 56px; grid-template-columns: 1fr;
      @media (min-width: 1024px) { grid-template-columns: minmax(0, 760px) 280px; align-items: start; }
    }
    .previa { display: flex; flex-direction: column; gap: 12px; position: sticky; top: 140px; }
    .previa-imagem { position: relative; }
    .previa-info { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
    .nome { font-weight: 500; overflow-wrap: anywhere; }
    .preco { white-space: nowrap; }
  `,
})
export class ProdutoForm implements OnInit {
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProdutoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly router = inject(Router);

  readonly categorias = signal<Categoria[]>([]);
  readonly carregando = signal(false);
  readonly salvando = signal(false);

  /** Validações iguais às do backend (RN04: preço > 0, estoque >= 0). */
  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    descricao: ['', [Validators.maxLength(1000)]],
    preco: [null as number | null, [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    estoque: [0, [Validators.required, Validators.min(0), Validators.max(100000), Validators.pattern(/^\d+$/)]],
    imagemUrl: ['', [Validators.maxLength(500), Validators.pattern(/^(https?:\/\/.+)?$/)]],
    categoriaId: [null as number | null, Validators.required],
    ativo: [true],
  });

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({
      next: (c) => this.categorias.set(c),
      error: (e) => this.notificacao.erro(e, 'Erro ao carregar categorias.'),
    });

    const id = this.id();
    if (!id) return;
    this.carregando.set(true);
    this.service
      .buscar(+id)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (p) =>
          this.form.patchValue({
            nome: p.nome,
            descricao: p.descricao ?? '',
            preco: p.preco,
            estoque: p.estoque,
            imagemUrl: p.imagemUrl ?? '',
            categoriaId: p.categoriaId,
            ativo: p.ativo,
          }),
        error: (e) => {
          this.notificacao.erro(e);
          this.router.navigate(['/produtos']);
        },
      });
  }

  nomeCategoria(id: number | null): string | null {
    return this.categorias().find((c) => c.id === id)?.nome ?? null;
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dados = {
      ...v,
      preco: Number(v.preco),
      estoque: Number(v.estoque),
      categoriaId: v.categoriaId!,
      imagemUrl: v.imagemUrl || null,
    };
    const id = this.id();
    this.salvando.set(true);
    (id ? this.service.atualizar(+id, dados) : this.service.criar(dados))
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: () => {
          this.notificacao.sucesso(id ? 'Produto atualizado.' : 'Produto cadastrado.');
          this.router.navigate(['/produtos']);
        },
        error: (e) => this.notificacao.erro(e),
      });
  }
}
