import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { CategoriaService } from '../../services/categoria.service';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';

/** Mesmo componente para cadastro (/categorias/novo) e edição (/categorias/edit/:id). */
@Component({
  selector: 'app-categoria-form',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './categoria-form.html',
})
export class CategoriaForm implements OnInit {
  /** Recebido da rota edit/:id (withComponentInputBinding). */
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CategoriaService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly salvando = signal(false);

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    descricao: ['', [Validators.maxLength(255)]],
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;
    this.carregando.set(true);
    this.service
      .buscar(+id)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (c) => this.form.patchValue({ nome: c.nome, descricao: c.descricao ?? '' }),
        error: (e) => {
          this.notificacao.erro(e);
          this.router.navigate(['/categorias']);
        },
      });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dados = this.form.getRawValue();
    const id = this.id();
    const req = id ? this.service.atualizar(+id, dados) : this.service.criar(dados);

    this.salvando.set(true);
    req.pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: () => {
        this.notificacao.sucesso(id ? 'Categoria atualizada.' : 'Categoria cadastrada.');
        this.router.navigate(['/categorias']);
      },
      error: (e) => this.notificacao.erro(e),
    });
  }
}
