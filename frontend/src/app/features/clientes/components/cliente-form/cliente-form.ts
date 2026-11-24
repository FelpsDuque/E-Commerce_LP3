import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';

@Component({
  selector: 'app-cliente-form',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './cliente-form.html',
})
export class ClienteForm implements OnInit {
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ClienteService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly salvando = signal(false);

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    telefone: ['', [Validators.pattern(/^(\d{10,11})?$/)]],
    endereco: ['', [Validators.maxLength(255)]],
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;
    this.carregando.set(true);
    this.service
      .buscar(+id)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (c) => this.form.patchValue({ ...c, telefone: c.telefone ?? '', endereco: c.endereco ?? '' }),
        error: (e) => {
          this.notificacao.erro(e);
          this.router.navigate(['/clientes']);
        },
      });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dados = { ...v, telefone: v.telefone || null, endereco: v.endereco || null };
    const id = this.id();
    this.salvando.set(true);
    (id ? this.service.atualizar(+id, dados) : this.service.criar(dados))
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: () => {
          this.notificacao.sucesso(id ? 'Cliente atualizado.' : 'Cliente cadastrado.');
          this.router.navigate(['/clientes']);
        },
        error: (e) => this.notificacao.erro(e),
      });
  }
}
