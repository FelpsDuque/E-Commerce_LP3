import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { CupomService } from '../../services/cupom.service';
import { NotificacaoService } from '../../../../shared/services/notificacao.service';

/** Converte Date -> 'yyyy-MM-dd' sem problemas de fuso horário. */
function paraIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

@Component({
  selector: 'app-cupom-form',
  imports: [
    ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatDatepickerModule,
    MatSlideToggleModule, MatButtonModule, MatProgressBarModule,
  ],
  templateUrl: './cupom-form.html',
})
export class CupomForm implements OnInit {
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CupomService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly salvando = signal(false);

  readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{3,30}$/)]],
    percentual: [10, [Validators.required, Validators.min(1), Validators.max(90)]],
    validade: [null as Date | null, Validators.required],
    ativo: [true],
  });

  ngOnInit(): void {
    // Código sempre em maiúsculas
    this.form.controls.codigo.valueChanges.subscribe((v) => {
      const maiusculo = v.toUpperCase();
      if (v !== maiusculo) this.form.controls.codigo.setValue(maiusculo, { emitEvent: false });
    });

    const id = this.id();
    if (!id) return;
    this.carregando.set(true);
    this.service
      .buscar(+id)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (c) =>
          this.form.patchValue({
            codigo: c.codigo,
            percentual: c.percentual,
            validade: new Date(c.validade + 'T00:00:00'),
            ativo: c.ativo,
          }),
        error: (e) => {
          this.notificacao.erro(e);
          this.router.navigate(['/cupons']);
        },
      });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dados = { ...v, percentual: Number(v.percentual), validade: paraIso(v.validade!) };
    const id = this.id();
    this.salvando.set(true);
    (id ? this.service.atualizar(+id, dados) : this.service.criar(dados))
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: () => {
          this.notificacao.sucesso(id ? 'Cupom atualizado.' : 'Cupom cadastrado.');
          this.router.navigate(['/cupons']);
        },
        error: (e) => this.notificacao.erro(e),
      });
  }
}
